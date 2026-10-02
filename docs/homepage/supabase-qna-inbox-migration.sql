-- ============================================================================
--  STRIX — 홈페이지 Q&A 자동 답변 · 운영자 Q&A Inbox
--  단일 원천: qna_inbox_devplan.md §2
--
--  Supabase 대시보드 → SQL Editor → 「1~4」를 복사해 1회 실행한다. 멱등(idempotent)하다.
--  「5. cron 등록」은 서버 함수(qna-inbox-sync)를 배포한 **뒤에** 따로 실행한다.
--
--  두 테이블 모두 **운영자만** 읽고 쓴다. 서버 함수는 service-role 로 RLS 를 우회한다.
--  앱의 운영자 판정(isAdminEmail)은 표시용이고, 실제 권한은 아래 정책이 갖는다.
-- ============================================================================

-- ── 1. 승인 답변집 ──────────────────────────────────────────────────────────
create table if not exists public.qna_library (
  id               uuid primary key default gen_random_uuid(),
  question         text not null check (char_length(question) between 2 and 20000),
  answer           text not null check (char_length(answer)   between 1 and 8000),
  -- usage 만 자동 게시 대상이다(qna_inbox_devplan.md D3). 나머지는 승인 게시에만 근거로 쓴다
  category         text not null default 'usage'
                     check (category in ('usage','judgment','bug','billing','other')),
  auto_allowed     boolean not null default false,
  -- 승인 당시 앱 버전. 출하 버전과 다르면 자동 게시하지 않는다(메뉴가 바뀌었을 수 있다)
  approved_version text not null check (approved_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  used_count       integer not null default 0,
  source_post_id   uuid references public.community_posts(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- 판정·버그·결제 항목은 자동 허용을 켤 수 없다
  constraint qna_library_auto_usage_only check (not auto_allowed or category = 'usage')
);
create index if not exists idx_qna_library_updated on public.qna_library(updated_at desc);

-- ── 2. 처리함(글 1건 = 1행) ─────────────────────────────────────────────────
create table if not exists public.qna_inbox (
  post_id      uuid primary key references public.community_posts(id) on delete cascade,
  state        text not null default 'pending'
                 check (state in ('pending','posted','auto_posted','discarded','retracted')),
  verdict      text check (verdict is null or verdict in ('answerable','escalate')),
  category     text check (category is null or category in ('usage','judgment','bug','billing','other')),
  reason       text check (reason is null or char_length(reason) <= 500),
  draft        text check (draft  is null or char_length(draft)  <= 8000),
  draft_at     timestamptz,
  -- 서버가 계산한 답변집 유사 항목 상위 3개: [{ "id": uuid, "score": 0~1 }]
  matches      jsonb not null default '[]'::jsonb,
  library_id   uuid references public.qna_library(id) on delete set null,
  comment_id   uuid references public.community_comments(id) on delete set null,
  app_version  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_qna_inbox_state on public.qna_inbox(state, created_at desc);

-- ── 3. RLS — 운영자만 ───────────────────────────────────────────────────────
alter table public.qna_library enable row level security;
alter table public.qna_inbox   enable row level security;

drop policy if exists qna_library_admin on public.qna_library;
create policy qna_library_admin on public.qna_library
  for all
  using      (auth.jwt()->>'email' = 'ksb3171@gmail.com')
  with check (auth.jwt()->>'email' = 'ksb3171@gmail.com');

drop policy if exists qna_inbox_admin on public.qna_inbox;
create policy qna_inbox_admin on public.qna_inbox
  for all
  using      (auth.jwt()->>'email' = 'ksb3171@gmail.com')
  with check (auth.jwt()->>'email' = 'ksb3171@gmail.com');

-- 익명·일반 회원에게는 테이블 권한 자체를 주지 않는다(정책 이전의 1차 차단)
revoke all on public.qna_library from anon;
revoke all on public.qna_inbox   from anon;

-- ── 4. 자동 게시 스위치 — 기본 OFF ──────────────────────────────────────────
--  🚨 기본값 false. 답변집이 쌓인 뒤 앱의 「자동 게시」 스위치로 켠다(qna_inbox_devplan.md U4).
insert into public.app_config(key, value) values ('qna_auto_post', 'false'::jsonb)
on conflict (key) do nothing;

-- updated_at 자동 갱신
create or replace function public.qna_touch_updated() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_qna_library_touch on public.qna_library;
create trigger trg_qna_library_touch before update on public.qna_library
  for each row execute procedure public.qna_touch_updated();

drop trigger if exists trg_qna_inbox_touch on public.qna_inbox;
create trigger trg_qna_inbox_touch before update on public.qna_inbox
  for each row execute procedure public.qna_touch_updated();

-- 답변집 사용 횟수 +1 — 서버 함수(자동 게시)와 운영자 앱(승인 게시)이 부른다.
--  읽고 더해 쓰면 동시 실행에서 하나가 사라지므로 한 문장으로 올린다.
--  security invoker: 호출자의 RLS 를 그대로 따른다(운영자·service-role 만 행이 보인다).
create or replace function public.qna_library_bump_used(lid uuid) returns void as $$
  update public.qna_library set used_count = used_count + 1 where id = lid;
$$ language sql security invoker;
revoke all on function public.qna_library_bump_used(uuid) from public, anon;
grant execute on function public.qna_library_bump_used(uuid) to authenticated, service_role;

-- ── 확인 ────────────────────────────────────────────────────────────────────
--  ① 두 테이블에 RLS 가 켜졌는가 (2행, relrowsecurity = true)
select relname, relrowsecurity from pg_class
 where relname in ('qna_library','qna_inbox') order by relname;
--  ② 자동 게시 스위치 (1행, false)
select key, value from public.app_config where key = 'qna_auto_post';
--  ③ 음성 대조군 — 일반 회원 계정으로 앱/홈페이지에서 select * from qna_inbox → **0행**이어야 한다

-- ============================================================================
--  5. cron 등록 — qna-inbox-sync 를 배포한 **뒤에** 실행한다
--     <RENEW_CRON_SECRET> 을 실제 값으로 바꾼다(구독 갱신 cron 과 같은 비밀값을 쓴다).
--     매시간 정각(UTC 기준이어도 '매시간'은 같다).
-- ============================================================================
-- create extension if not exists pg_cron;
-- create extension if not exists pg_net;
-- select cron.schedule(
--   'strix-qna-inbox-sync',
--   '0 * * * *',
--   $$
--   select net.http_post(
--     url     := 'https://vkptgohyktnkrludpwej.supabase.co/functions/v1/qna-inbox-sync',
--     headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<RENEW_CRON_SECRET>'),
--     body    := '{}'::jsonb
--   );
--   $$
-- );
--  해제: select cron.unschedule('strix-qna-inbox-sync');
