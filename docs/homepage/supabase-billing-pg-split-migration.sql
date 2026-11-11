-- ============================================================================
--  STRIX site — 결제 두 갈래 전환 (PortOne → 토스페이먼츠 직접 · Paddle)
--  단일 원천: pricing_payment_devplan.md §17.7a(결정) · §17.7b(계획 ④)
--
--  Supabase 대시보드 → SQL Editor → 이 파일 전체를 복사해 1회 실행한다.
--  멱등(idempotent)하다 — 여러 번 돌려도 안전하다.
--  선행: supabase-billing-migration.sql · supabase-billing-key-hardening.sql 이 이미 적용돼 있어야 한다.
--
--  🚨 실행 순서 — 이 SQL → Edge Functions 배포(create-checkout · toss-webhook · paddle-webhook ·
--     renew-subscriptions · cancel-subscription) → 홈페이지(docs/) 배포.
--     옛 create-checkout 은 pg_provider='portone' 을 쓰므로, 이 SQL 뒤에는 옛 함수로 결제가 안 된다
--     (지금은 billing_enabled=false 라 실결제 경로가 닫혀 있다).
--
--  ── 무엇을 바꾸는가 ────────────────────────────────────────────────────────
--   1. 통화 = KRW(토스) · USD(Paddle) 만 · pg_provider = 'toss' | 'paddle' 만 (기본값 제거 — 함수가 반드시 적는다)
--   2. subscriptions.pg_customer_key(토스 customerKey) · pg_customer_id(Paddle ctm_) — 멤버 클라이언트에 비공개
--      pg_subscription_id 의 뜻 = 토스: 빌링키 / Paddle: 구독 ID(sub_)
--   3. organizations.billing_country — 첫 결제 때 서버가 기록, 이후 갈래 고정
--   4. billing_key_issues 에 provider · country · customer_key · pg_ref(Paddle txn_) 추가
--   5. pg_webhook_events — 웹훅 멱등(같은 이벤트 두 번 처리 금지)
--   6. payments (pg_provider, pg_payment_id) 유일 · Paddle 구독 ID 유일
--   6b. 국내 구매자 구분(사업자/개인) · 국세청 확인 결과 · 환불 규정 · 업무용 동의 시각 · 환불 계산값 (§17.7d)
-- ============================================================================

-- ── 0. 사전 확인 — 옛 통화·옛 PG 행이 있으면 멈춘다 ───────────────────────────
--  무료 베타라 실결제 0건이어야 정상이다. 있으면 손으로 정리한 뒤 다시 돌린다(조용히 지우지 않는다).
do $$
declare n int;
begin
  select count(*) into n from public.subscriptions
   where currency not in ('KRW','USD') or pg_provider not in ('toss','paddle');
  if n > 0 then
    raise exception '옛 PG·옛 통화 구독 행 %건 — 정리 후 다시 실행 (select id,pg_provider,currency from public.subscriptions)', n;
  end if;
  select count(*) into n from public.payments
   where currency not in ('KRW','USD') or pg_provider not in ('toss','paddle');
  if n > 0 then
    raise exception '옛 PG·옛 통화 결제 행 %건 — 정리 후 다시 실행 (select id,pg_provider,currency from public.payments)', n;
  end if;
end $$;

-- ── 1. 통화 · 공급자 제약 ───────────────────────────────────────────────────
--  옛 이름(자동 이름 <table>_<column>_check)과 새 이름을 둘 다 지운 뒤 새 이름으로 건다.
alter table public.subscriptions drop constraint if exists subscriptions_currency_check;
alter table public.subscriptions drop constraint if exists subscriptions_currency_pg_check;
alter table public.subscriptions add  constraint subscriptions_currency_pg_check check (currency in ('KRW','USD'));

alter table public.subscriptions alter column pg_provider drop default;
alter table public.subscriptions drop constraint if exists subscriptions_pg_provider_check;
alter table public.subscriptions add  constraint subscriptions_pg_provider_check check (pg_provider in ('toss','paddle'));

alter table public.payments alter column currency drop default;
alter table public.payments drop constraint if exists payments_currency_check;
alter table public.payments drop constraint if exists payments_currency_pg_check;
alter table public.payments add  constraint payments_currency_pg_check check (currency in ('KRW','USD'));

alter table public.payments alter column pg_provider drop default;
alter table public.payments drop constraint if exists payments_pg_provider_check;
alter table public.payments add  constraint payments_pg_provider_check check (pg_provider in ('toss','paddle'));

-- ── 2. 구독 — PG 고객 식별자 ────────────────────────────────────────────────
--  🚨 grant 목록(supabase-billing-key-hardening.sql §1)에 **넣지 않는다**.
--     컬럼 권한은 화이트리스트라 새 컬럼은 자동으로 authenticated 에게 안 보인다.
--     토스 청구 = 빌링키 + customerKey 두 값 → 둘 다 멤버에게 숨긴다(SEC-07 과 같은 짝).
alter table public.subscriptions add column if not exists pg_customer_key text;  -- 토스 customerKey
alter table public.subscriptions add column if not exists pg_customer_id  text;  -- Paddle ctm_…

-- Paddle 구독 1개 = 우리 구독 행 1개 (웹훅 upsert 의 키)
create unique index if not exists uq_sub_paddle_subscription
  on public.subscriptions(pg_subscription_id)
  where pg_provider = 'paddle' and pg_subscription_id is not null;

-- ── 3. 회사 결제 국가 ──────────────────────────────────────────────────────
alter table public.organizations add column if not exists billing_country text;
alter table public.organizations drop constraint if exists organizations_billing_country_check;
alter table public.organizations add  constraint organizations_billing_country_check
  check (billing_country is null or billing_country ~ '^[A-Z]{2}$');
--  계정 화면이 읽는다(키가 아니다). organizations 는 컬럼 화이트리스트(§8b)라 명시적으로 연다.
grant select (billing_country) on public.organizations to authenticated;

-- ── 4. 결제 핸들 ───────────────────────────────────────────────────────────
alter table public.billing_key_issues add column if not exists provider     text;
alter table public.billing_key_issues add column if not exists country      text;
alter table public.billing_key_issues add column if not exists customer_key text;  -- 토스: start 가 만든 값, confirm 의 successUrl 값과 대조
alter table public.billing_key_issues add column if not exists pg_ref       text;  -- Paddle: 서버가 만든 txn_…
alter table public.billing_key_issues drop constraint if exists billing_key_issues_provider_check;
alter table public.billing_key_issues add  constraint billing_key_issues_provider_check
  check (provider is null or provider in ('toss','paddle'));
create index if not exists idx_bki_pg_ref on public.billing_key_issues(pg_ref) where pg_ref is not null;

-- ── 5. 웹훅 멱등 표 ────────────────────────────────────────────────────────
create table if not exists public.pg_webhook_events (
  provider    text        not null check (provider in ('toss','paddle')),
  event_id    text        not null,
  event_type  text,
  received_at timestamptz not null default now(),
  primary key (provider, event_id)
);
alter table public.pg_webhook_events enable row level security;
-- 정책을 만들지 않는다 = anon/authenticated 는 한 행도 못 본다(service-role 전용).
revoke all on public.pg_webhook_events from anon, authenticated;

-- ── 6. 결제 이력 이중 기록 방지 ────────────────────────────────────────────
create unique index if not exists uq_pay_provider_payment
  on public.payments(pg_provider, pg_payment_id)
  where pg_payment_id is not null;

-- ── 6b. 국내 구매자 구분 · 환불 동의 (§17.7d · 2026-11-10) ───────────────────
--  토스 갈래만 쓴다(Paddle 행은 전부 null). 환불은 수동 절차(§17.4)지만 계산에 필요한 값은 남긴다:
--  개인 연/Pioneer 중도해지 환불 = period_paid_amount × 남은 일수 ÷ 계약 일수 − period_paid_amount × 10% (음수면 0)
--  계약 일수 = current_period_end − current_period_start (§17.7d 2차 개정 · 계산식 단일 원천 = _shared/buyer.ts).
--  🚨 grant 목록에 넣지 않는다 — 사업자번호·동의 기록은 멤버 클라이언트에 비공개(service-role 전용).
alter table public.subscriptions add column if not exists buyer_type             text;
alter table public.subscriptions add column if not exists business_no            text;
alter table public.subscriptions add column if not exists biz_status_code        text;   -- 국세청 b_stt_cd (01 계속사업자)
alter table public.subscriptions add column if not exists biz_status_label       text;
alter table public.subscriptions add column if not exists biz_verified_at        timestamptz;
alter table public.subscriptions add column if not exists refund_terms_variant   text;
alter table public.subscriptions add column if not exists refund_terms_agreed_at timestamptz;
alter table public.subscriptions add column if not exists business_use_agreed_at timestamptz;
alter table public.subscriptions add column if not exists current_period_start   timestamptz;
alter table public.subscriptions add column if not exists period_paid_amount     numeric;

alter table public.billing_key_issues add column if not exists buyer_type             text;
alter table public.billing_key_issues add column if not exists business_no            text;
alter table public.billing_key_issues add column if not exists biz_status_code        text;
alter table public.billing_key_issues add column if not exists biz_status_label       text;
alter table public.billing_key_issues add column if not exists biz_verified_at        timestamptz;
alter table public.billing_key_issues add column if not exists refund_terms_variant   text;
alter table public.billing_key_issues add column if not exists refund_terms_agreed_at timestamptz;
alter table public.billing_key_issues add column if not exists business_use_agreed_at timestamptz;

--  체험 1회 = 계정 1회(trials pk = user_id) + 같은 사업자등록번호 1회(아래 유일 인덱스 · §17.7d · 본인인증 미도입).
alter table public.trials add column if not exists business_no text;
alter table public.trials drop constraint if exists trials_business_no_check;
alter table public.trials add  constraint trials_business_no_check check (business_no is null or business_no ~ '^[0-9]{10}$');
create unique index if not exists uq_trials_business_no on public.trials(business_no) where business_no is not null;
--  trials 의 RLS 는 본인 select(trial_select) — 자기 번호만 보인다. 남의 번호는 안 보인다.

--  DB 가 최종 판정자다(security_hardening_devplan.md §10) — 함수가 실수해도 아래를 못 넘는다.
alter table public.subscriptions drop constraint if exists subscriptions_buyer_check;
alter table public.subscriptions add  constraint subscriptions_buyer_check check (
  (buyer_type is null or buyer_type in ('business','individual'))
  and (business_no is null or business_no ~ '^[0-9]{10}$')
  and (refund_terms_variant is null or refund_terms_variant in ('business_no_refund','individual_monthly','individual_prorated'))
  -- 사업자 = 번호 · 국세청 계속사업자(01) · 확인 시각 · 업무용 동의가 모두 있어야 한다
  and (buyer_type is distinct from 'business' or
       (business_no is not null and biz_status_code = '01' and biz_verified_at is not null
        and business_use_agreed_at is not null and refund_terms_variant = 'business_no_refund'))
  -- 개인 = 사업자 칸 비움 · 플랜에 맞는 환불 규정
  and (buyer_type is distinct from 'individual' or
       (business_no is null and refund_terms_variant in ('individual_monthly','individual_prorated')))
  -- 개인 연/Pioneer = 환불식 입력값(결제액 · 기간 시작 · 기간 끝)이 반드시 있다
  and (refund_terms_variant is distinct from 'individual_prorated' or
       (period_paid_amount is not null and current_period_start is not null and current_period_end is not null))
  -- 토스 구독 = 구매자 구분과 환불 규정 동의가 반드시 있다
  and (pg_provider <> 'toss' or (buyer_type is not null and refund_terms_agreed_at is not null))
);

-- ── 7. 확인 ────────────────────────────────────────────────────────────────
--  ① authenticated 가 읽을 수 있는 subscriptions 컬럼 — pg_subscription_id · pg_customer_key ·
--     pg_customer_id 가 **없어야** 한다.
select column_name
  from information_schema.column_privileges
 where table_schema = 'public' and table_name = 'subscriptions'
   and grantee = 'authenticated' and privilege_type = 'SELECT'
 order by column_name;
--  ② organizations 공개 컬럼 — billing_country 가 있고 ai_api_key · ai_stt_key 는 없어야 한다.
select column_name
  from information_schema.column_privileges
 where table_schema = 'public' and table_name = 'organizations'
   and grantee = 'authenticated' and privilege_type = 'SELECT'
 order by column_name;
--  ③ pg_webhook_events 가 잠겨 있는지 (rls_enabled = true)
select relname, relrowsecurity as rls_enabled
  from pg_class where oid = 'public.pg_webhook_events'::regclass;
