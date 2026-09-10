-- ============================================================================
--  STRIX site — 빌링키 유출·도용 차단   (SEC-07)
--  단일 원천: security_hardening_devplan.md §5 SEC-07 · §7 단계 5
--
--  Supabase 대시보드 → SQL Editor → 이 파일 전체를 복사해 1회 실행한다.
--  멱등(idempotent)하다 — 여러 번 돌려도 안전하다.
--
--  🚨 실행 순서 — **홈페이지(docs/) 를 먼저 배포하고 이 SQL 을 나중에** 돌린다.
--     `billing.js` 가 `select('*')` 로 subscriptions 를 읽고 있었다. 컬럼 revoke 를 먼저 걸면
--     옛 스크립트가 살아 있는 동안 **결제/계정 화면이 빈 화면**이 된다. 순서를 지킬 것.
--     (지금 리포의 billing.js 는 이미 컬럼을 명시하도록 고쳐져 있다.)
--
--  ── 무엇을 고치는가 ────────────────────────────────────────────────────────
--  `subscriptions.pg_subscription_id` 는 이름과 달리 **PortOne 빌링키**다.
--  그 문자열 하나면 `create-checkout` 의 `confirm` 으로 카드를 긁을 수 있다.
--
--  그런데 `sub_select` 정책은 **같은 회사 멤버 전원**에게 그 행을 열어 준다:
--      create policy sub_select on public.subscriptions
--        for select using (org_id in (select public.my_org_ids()));
--  `organizations` 는 AI 키 때문에 컬럼 revoke 를 걸어 뒀는데(§8b), `subscriptions` 에는
--  **그 짝이 빠져 있었다.** 그래서 멤버가 오너의 빌링키를 그대로 읽을 수 있었다.
--
--  이 파일은 두 가지를 한다:
--    ① subscriptions 컬럼 revoke + 화이트리스트 grant (pg_subscription_id 제외)
--    ② billing_key_issues — `start` 가 발급한 issueId 를 저장해 `confirm` 에서 대조하게 한다
--  ②의 소비자는 supabase/functions/create-checkout/index.ts 다. **함수와 함께 배포할 것.**
-- ============================================================================

-- ── 1. subscriptions 컬럼 권한 ──────────────────────────────────────────────
--  organizations(§8b)와 같은 형태다. 클라이언트는 이제 컬럼을 명시해서 읽어야 한다.
--  ※ pg_subscription_id 를 읽는 곳은 service-role Edge Function 뿐이다
--    (renew-subscriptions/index.ts:72 가 컬럼을 명시해 읽는다 — service_role 은 영향 없음).
revoke select on public.subscriptions from authenticated;
grant  select (
  id, org_id, user_id, status, plan, pg_provider, currency,
  unit_amount, renewal_unit_amount, seats,
  current_period_end, cancel_at_period_end, is_pioneer,
  created_at, updated_at
) on public.subscriptions to authenticated;
-- 제외: pg_subscription_id(빌링키) · renewal_notice_sent_at(내부 발송 기록)

-- ── 2. 빌링키 발급 핸들 (issueId) 보관 ──────────────────────────────────────
--  create-checkout 의 `start` 가 issueId 를 만들어 돌려주지만 **어디에도 저장하지 않았다.**
--  그래서 `confirm` 은 "이 결제가 정말 start 를 거쳤는지" 알 방법이 없었다.
--  여기에 저장하고 confirm 에서 (본인 것인가 · 아직 안 썼는가 · 오래되지 않았는가)를 본다.
create table if not exists public.billing_key_issues (
  issue_id   text        primary key,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  plan       text        not null,
  currency   text        not null,
  seats      int         not null,
  created_at timestamptz not null default now(),
  used_at    timestamptz
);
create index if not exists idx_bki_user on public.billing_key_issues(user_id, created_at desc);

-- 사용자 클라이언트는 이 표를 볼 일이 없다 — service-role(Edge Function) 전용.
alter table public.billing_key_issues enable row level security;
-- 정책을 만들지 않는다 = RLS 아래에서 anon/authenticated 는 한 행도 못 본다.
revoke all on public.billing_key_issues from anon, authenticated;

-- 정리(선택) — 핸들은 1시간이면 만료되므로 오래된 행은 남겨 둘 이유가 없다.
--  자동 정리는 넣지 않았다(cron 의존을 늘리지 않는다). 쌓이면 가끔 아래를 돌린다:
--    delete from public.billing_key_issues where created_at < now() - interval '30 days';

-- ── 3. 확인 ─────────────────────────────────────────────────────────────────
--  ① subscriptions 에서 authenticated 가 읽을 수 있는 컬럼 목록
--     → pg_subscription_id 가 **없어야** 한다.
select column_name
  from information_schema.column_privileges
 where table_schema = 'public'
   and table_name   = 'subscriptions'
   and grantee      = 'authenticated'
   and privilege_type = 'SELECT'
 order by column_name;

--  ② billing_key_issues 가 만들어졌고 잠겨 있는지 (rls_enabled 가 true 여야 한다)
select relname, relrowsecurity as rls_enabled
  from pg_class
 where oid = 'public.billing_key_issues'::regclass;
