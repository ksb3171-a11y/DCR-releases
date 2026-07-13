-- ================================================================
-- DCR 상용화 마이그레이션 (구독 · 결제 · 라이선스 · 좌석 풀) — P1
-- 단일 원천: pricing_payment_devplan.md
--
-- 실행: Supabase 대시보드 → SQL Editor → 전체 복사 후 1회 실행
-- 성격: 전부 additive(신규 테이블) + 보안 강화 + 기존 사용자 백필.
--       기존 베타 흐름(profiles 읽기/다운로드 게이팅/feature board) 무손상.
--
-- 권위 원천 규약:
--   · 구독상태 권위 = subscriptions (profiles.plan/expires_at는 레거시 표시용)
--   · 결제로 통제되는 모든 컬럼은 사용자 쓰기 금지 → service-role(Edge Function)만 기록
--   · 모든 신규 테이블 RLS = 본인/같은 회사 select만, insert/update/delete 정책 없음(=거부)
-- ================================================================


-- ----------------------------------------------------------------
-- 0. app_config — 원격 토글 플래그 (commercial_mode / billing_enabled)
--    재배포 없이 스위치만으로 베타↔상용 / 실결제 on·off
-- ----------------------------------------------------------------
create table if not exists public.app_config (
  key        text primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);

insert into public.app_config(key, value) values
  ('commercial_mode', 'false'::jsonb),   -- false = 베타 모드(체험시계 미가동)
  ('billing_enabled', 'false'::jsonb)     -- false = 실결제(real money) 미연결
on conflict (key) do nothing;

alter table public.app_config enable row level security;

-- 읽기: 누구나(앱/홈페이지가 모드 판정). 쓰기: 관리자만(평시), 그 외 service-role.
drop policy if exists app_config_select on public.app_config;
create policy app_config_select on public.app_config
  for select using (true);

drop policy if exists app_config_admin_write on public.app_config;
create policy app_config_admin_write on public.app_config
  for all
  using      (auth.jwt()->>'email' = 'ksb3171@gmail.com')
  with check (auth.jwt()->>'email' = 'ksb3171@gmail.com');


-- ----------------------------------------------------------------
-- 1. organizations — 회사(좌석 풀 상위 레벨)
--    seats = 동시 허용 사용자 수 = active 구독 수(결제 webhook가 동기화)
--    join_code = 회사 참여코드(직원이 입력하면 자동 합류 — 이메일 초대 대체)
--    ai_api_key / ai_stt_key = 회사 공용 AI 키(멤버가 상속 → 회사가 AI 비용 100% 부담)
--      ★ 컬럼 권한으로 멤버의 직접 SELECT를 차단(§8b). 멤버에겐 verify-license가 전달.
-- ----------------------------------------------------------------
create table if not exists public.organizations (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null default '',
  owner_user_id uuid        not null references auth.users(id) on delete cascade,
  seats         int         not null default 0,
  join_code     text,
  ai_api_key    text,
  ai_stt_key    text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_org_owner on public.organizations(owner_user_id);
-- 부분 재실행/구버전 테이블 안전장치(create table if not exists는 컬럼을 추가하지 않음):
alter table public.organizations add column if not exists join_code  text;
alter table public.organizations add column if not exists ai_api_key text;
alter table public.organizations add column if not exists ai_stt_key text;
-- 참여코드는 전역 유일(대문자 8자, 모호문자 제외). NULL 허용(코드 미발급 회사).
create unique index if not exists idx_org_joincode on public.organizations(join_code) where join_code is not null;


-- ----------------------------------------------------------------
-- 2. org_members — 멤버(개인 로그인, 무제한 named user)
-- ----------------------------------------------------------------
create table if not exists public.org_members (
  org_id     uuid        not null references public.organizations(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  role       text        not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index if not exists idx_om_user on public.org_members(user_id);

-- RLS 재귀 방지용 헬퍼: 현재 사용자가 속한 org_id 집합 (security definer로 RLS 우회)
create or replace function public.my_org_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select org_id from public.org_members where user_id = auth.uid()
$$;


-- ----------------------------------------------------------------
-- 2b. org_invites — 미가입자 보류 초대 (아직 DCR 계정이 없는 이메일)
--     가입 시 handle_new_user가 자동 수락 → org_members 편입. 이미 가입한
--     이메일은 org-member 함수가 곧장 org_members에 추가하므로 여기 안 들어옴.
-- ----------------------------------------------------------------
create table if not exists public.org_invites (
  id          uuid        primary key default gen_random_uuid(),
  org_id      uuid        not null references public.organizations(id) on delete cascade,
  email       text        not null,
  role        text        not null default 'member' check (role in ('admin','member')),
  invited_by  uuid        references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  accepted_at timestamptz
);
-- 회사별 이메일 1건(대소문자 무시). 재초대는 upsert/무시.
create unique index if not exists idx_orginv_org_email on public.org_invites(org_id, lower(email));
-- 가입 시 이메일로 보류 초대 조회.
create index if not exists idx_orginv_email on public.org_invites(lower(email)) where accepted_at is null;


-- ----------------------------------------------------------------
-- 3. subscriptions — 구독(회사 귀속, 구독상태 권위 원천)
--    한 회사가 N개 구독(좌석) 보유 가능 → org_id 중복 허용
-- ----------------------------------------------------------------
create table if not exists public.subscriptions (
  id                   uuid        primary key default gen_random_uuid(),
  org_id               uuid        not null references public.organizations(id) on delete cascade,
  user_id              uuid        references auth.users(id) on delete set null,  -- 결제 주체
  status               text        not null check (status in ('trialing','active','past_due','canceled','expired')),
  plan                 text        not null check (plan in ('annual','monthly','pioneer_annual')),
  pg_provider          text        not null default 'portone',
  pg_subscription_id   text,                                   -- PG측 구독 식별자(webhook 매칭)
  currency             text        not null check (currency in ('KRW','USD','JPY','CNY')),
  unit_amount          numeric     not null check (unit_amount > 0), -- 현재 기간 좌석당 고정가
  renewal_unit_amount  numeric     not null check (renewal_unit_amount > 0), -- 다음 갱신 좌석당 고정가(Pioneer는 Annual 정가)
  seats                int         not null default 1,
  current_period_end   timestamptz,                            -- 이 시점까지 유효(만료 판정 기준)
  cancel_at_period_end boolean     not null default false,
  is_pioneer           boolean     not null default false,     -- 1년차 프로모션(갱신 시 정가)
  renewal_notice_sent_at timestamptz,                          -- 갱신 사전고지 메일 발송 시각(기간당 1회, 갱신 시 null 리셋)
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists idx_sub_org  on public.subscriptions(org_id);
create index if not exists idx_sub_pgid on public.subscriptions(pg_subscription_id);
-- 부분 재실행/구버전 테이블 안전장치(create table if not exists가 컬럼은 추가 안 하므로):
alter table public.subscriptions add column if not exists renewal_notice_sent_at timestamptz;


-- ----------------------------------------------------------------
-- 4. payments — 결제 이력/감사
-- ----------------------------------------------------------------
create table if not exists public.payments (
  id              uuid        primary key default gen_random_uuid(),
  org_id          uuid        references public.organizations(id) on delete set null,
  user_id         uuid        references auth.users(id) on delete set null,
  subscription_id uuid        references public.subscriptions(id) on delete set null,
  pg_provider     text        not null default 'portone',
  pg_payment_id   text,
  amount          numeric     not null,
  currency        text        not null default 'KRW',
  status          text        not null check (status in ('paid','refunded','failed')),
  paid_at         timestamptz,
  raw_event       jsonb,                                       -- PG 원본 이벤트(감사/디버깅)
  created_at      timestamptz not null default now()
);
create index if not exists idx_pay_org on public.payments(org_id);


-- ----------------------------------------------------------------
-- 5. trials — 30일 무료 체험 (상용 모드 진입 후 "앱 최초 실행" 기준)
--    ★ commercial_mode OFF(베타)에서는 claim-trial을 호출하지 않으므로 row 미생성
-- ----------------------------------------------------------------
create table if not exists public.trials (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ends_at    timestamptz not null,
  extended   boolean     not null default false,               -- 미사용자 14일 연장 1회
  created_at timestamptz not null default now()
);


-- ----------------------------------------------------------------
-- 6. app_sessions — Floating 좌석 동시성 (동시 사용자 = 구독 수)
--    heartbeat timeout 초과/released_at 세션은 좌석 회수
-- ----------------------------------------------------------------
create table if not exists public.app_sessions (
  id             uuid        primary key default gen_random_uuid(),
  org_id         uuid        not null references public.organizations(id) on delete cascade,
  user_id        uuid        not null references auth.users(id) on delete cascade,
  device_id      text,
  started_at     timestamptz not null default now(),
  last_heartbeat timestamptz not null default now(),
  released_at    timestamptz
);
-- 활성 세션(미반환) 빠른 집계용 부분 인덱스
create index if not exists idx_sess_org_active
  on public.app_sessions(org_id) where released_at is null;

-- 좌석 획득은 반드시 단일 트랜잭션에서 직렬화한다.
-- Edge Function의 "count 후 insert"는 동시 요청 시 좌석을 초과할 수 있으므로,
-- org별 advisory lock 아래에서 stale 회수/동일기기 재사용/count/insert를 수행한다.
create or replace function public.acquire_app_seat(
  p_user_id uuid,
  p_device_id text,
  p_timeout_minutes int default 3
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org_id uuid;
  v_seats int;
  v_active int;
  v_session_id uuid;
begin
  -- 가입코드 모델: 사용자는 0~N개 회사에 속할 수 있다(자동 1인 회사 없음).
  -- 좌석이 있는 소속 회사를 우선 선택한다(좌석 큰 순).
  select o.id
    into v_org_id
    from public.org_members m
    join public.organizations o on o.id = m.org_id
   where m.user_id = p_user_id
     and o.seats > 0
   order by o.seats desc, o.created_at
   limit 1;

  if v_org_id is null then
    select o.id
      into v_org_id
      from public.organizations o
     where o.owner_user_id = p_user_id
     order by o.created_at
     limit 1;
  end if;

  if v_org_id is null then
    select m.org_id into v_org_id
      from public.org_members m
     where m.user_id = p_user_id
     order by m.created_at
     limit 1;
  end if;

  if v_org_id is null then
    return jsonb_build_object('error', 'no organization');
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_org_id::text, 0));

  update public.app_sessions
     set released_at = now()
   where org_id = v_org_id
     and released_at is null
     and last_heartbeat < now() - greatest(p_timeout_minutes, 1) * interval '1 minute';

  select seats into v_seats from public.organizations where id = v_org_id for update;
  v_seats := coalesce(v_seats, 0);

  -- 앱은 active 라이선스에만 이 RPC를 호출한다. 검증과 획득 사이에 구독이
  -- 만료되어 좌석이 0이 되었다면 베타 우회하지 않고 차단한다.
  if v_seats <= 0 then
    return jsonb_build_object('ok', false, 'reason', 'no_seats', 'seats', 0, 'active', 0);
  end if;

  -- React StrictMode 중복 호출 및 비정상 종료 직후 동일 설치 재실행은
  -- 새 좌석을 소비하지 않고 기존 활성 세션을 이어 쓴다.
  if p_device_id is not null and p_device_id <> '' then
    select s.id
      into v_session_id
      from public.app_sessions s
     where s.org_id = v_org_id
       and s.user_id = p_user_id
       and s.device_id = p_device_id
       and s.released_at is null
     order by s.started_at desc
     limit 1;

    if v_session_id is not null then
      update public.app_sessions set last_heartbeat = now() where id = v_session_id;
      select count(*) into v_active from public.app_sessions
       where org_id = v_org_id and released_at is null;
      return jsonb_build_object(
        'ok', true, 'reused', true, 'sessionId', v_session_id,
        'seats', coalesce(v_seats, 0), 'active', v_active
      );
    end if;
  end if;

  select count(*) into v_active
    from public.app_sessions
   where org_id = v_org_id and released_at is null;

  if v_active >= v_seats then
    return jsonb_build_object(
      'ok', false, 'reason', 'no_seats', 'seats', v_seats, 'active', v_active
    );
  end if;

  insert into public.app_sessions (org_id, user_id, device_id)
  values (v_org_id, p_user_id, nullif(p_device_id, ''))
  returning id into v_session_id;

  return jsonb_build_object(
    'ok', true, 'sessionId', v_session_id,
    'seats', v_seats, 'active', v_active + 1
  );
end;
$$;

revoke all on function public.acquire_app_seat(uuid, text, int) from public, anon, authenticated;
grant execute on function public.acquire_app_seat(uuid, text, int) to service_role;


-- ----------------------------------------------------------------
-- 7. RLS 활성화 + select 정책 (쓰기 정책 없음 = service-role만 기록)
-- ----------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.org_members   enable row level security;
alter table public.org_invites   enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments      enable row level security;
alter table public.trials        enable row level security;
alter table public.app_sessions  enable row level security;

-- organizations: 내가 속한 회사만 조회
drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations
  for select using (id in (select public.my_org_ids()));

-- org_members: 같은 회사 멤버만 조회
drop policy if exists om_select on public.org_members;
create policy om_select on public.org_members
  for select using (org_id in (select public.my_org_ids()));

-- org_invites: 같은 회사 보류 초대만 조회(쓰기 없음 = org-member 함수 service-role만)
drop policy if exists orginv_select on public.org_invites;
create policy orginv_select on public.org_invites
  for select using (org_id in (select public.my_org_ids()));

-- subscriptions: 같은 회사 구독만 조회
drop policy if exists sub_select on public.subscriptions;
create policy sub_select on public.subscriptions
  for select using (org_id in (select public.my_org_ids()));

-- payments: 같은 회사 결제이력만 조회
drop policy if exists pay_select on public.payments;
create policy pay_select on public.payments
  for select using (org_id in (select public.my_org_ids()));

-- trials: 본인 것만 조회
drop policy if exists trial_select on public.trials;
create policy trial_select on public.trials
  for select using (user_id = auth.uid());

-- app_sessions: 같은 회사 세션만 조회(만석 안내용)
drop policy if exists sess_select on public.app_sessions;
create policy sess_select on public.app_sessions
  for select using (org_id in (select public.my_org_ids()));


-- ----------------------------------------------------------------
-- 8. profiles 보안 강화 — 결제 통제 컬럼 사용자 쓰기 차단 (★ 위조 방지)
--    기존 RLS "Users can update own profile"는 본인 row의 전체 컬럼 수정 허용.
--    → plan/expires_at/is_blocked 등을 사용자가 위조 가능했음.
--    컬럼 수준 권한으로 사용자 편집 가능 컬럼만 화이트리스트.
-- ----------------------------------------------------------------
revoke update on public.profiles from authenticated;
grant  update (name, affiliation, phone) on public.profiles to authenticated;
-- 결과: 사용자는 name/affiliation/phone만 수정 가능.
--       plan/expires_at/is_blocked/email/created_at은 service-role(Edge Function)만.


-- ----------------------------------------------------------------
-- 8b. organizations 컬럼 권한 — 회사 AI 키를 멤버 클라이언트에 노출하지 않음
--     멤버는 회사 정보(이름/좌석/참여코드)는 읽되, ai_api_key/ai_stt_key는 차단.
--     키는 verify-license(service-role)가 자격 있는 멤버에게만 응답으로 전달한다.
--     ※ 이 때문에 클라이언트는 organizations를 select('*') 하지 말고 컬럼을 명시할 것.
-- ----------------------------------------------------------------
revoke select on public.organizations from authenticated;
grant  select (id, name, owner_user_id, seats, join_code, created_at)
  on public.organizations to authenticated;
-- 쓰기는 정책 없음(=service-role Edge Function만). ai_api_key/ai_stt_key는 읽기에서도 제외.


-- ----------------------------------------------------------------
-- 9. handle_new_user 확장 — 신규 가입 처리 (★ 가입코드 모델: 자동 회사 생성 안 함)
--    가입자는 회사 없이 시작한다. 회사는 (a) 첫 구독 시 create-checkout가 생성하거나
--    (b) 회사 참여코드/이메일 초대로 기존 회사에 합류함으로써 연결된다.
--    → "전원 자기 1인 회사 owner"로 인한 org 난립(sprawl)과 멤버의 2-org 혼란을 제거.
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, affiliation, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'affiliation', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );

  -- 미가입자 보류 이메일 초대 자동 수락 → 초대한 회사의 멤버로 편입(가입코드의 보조 경로).
  insert into public.org_members (org_id, user_id, role)
  select i.org_id, new.id, i.role
    from public.org_invites i
   where lower(i.email) = lower(new.email)
     and i.accepted_at is null
  on conflict (org_id, user_id) do nothing;

  update public.org_invites
     set accepted_at = now()
   where lower(email) = lower(new.email)
     and accepted_at is null;

  return new;
end;
$$ language plpgsql security definer;
-- (트리거 on_auth_user_created 는 기존 supabase-setup.sql 그대로 사용)


-- ----------------------------------------------------------------
-- 10. (백필 제거) — 가입코드 모델에서는 1인 회사를 자동 생성하지 않으므로
--     기존 사용자 백필도 하지 않는다. 회사 없는 사용자는 베타/체험 또는
--     참여코드/구독으로 회사에 연결될 때까지 org 없이 존재한다(정상).
-- ----------------------------------------------------------------

-- ================================================================
-- 끝. 이후 P2(Edge Functions)에서 위 테이블에 service-role로 기록.
-- ================================================================
