-- ============================================================================
--  STRIX site — site_images 잠그기   (SEC-11 짝)
--  단일 원천: security_hardening_devplan.md §5 SEC-11 · §6-2 · §13-10
--
--  Supabase 대시보드 → SQL Editor → 이 파일 전체를 복사해 1회 실행한다.
--  멱등(idempotent)하다 — 여러 번 돌려도 안전하다.
--
--  ── 왜 필요한가 ────────────────────────────────────────────────────────────
--  홈페이지 관리자 화면이 이미지를 올린 뒤 URL 을 여기에 적는다:
--      await _sb.from('site_images').upsert({ key, url: newUrl })
--  그런데 **이 표의 정의가 리포 어디에도 없다** — 운영 대시보드에서 손으로 만들어졌고,
--  RLS 가 걸려 있는지 확인된 적이 없다(개발서 §6-2 미확인 항목).
--
--  🚨 RLS 가 없으면 **로그인한 누구나** 홈페이지 이미지 URL 을 바꿔치기할 수 있다.
--     업로드를 서명으로 막아도(SEC-11), 남의 이미지 URL 을 여기에 적으면 화면은 그대로 바뀐다.
--     업로드 잠그기와 **짝**이라 함께 실행한다.
--
--  ⚠️ 이미 표가 있고 데이터가 있어도 안전하다 — `create table if not exists` 이고,
--     아래 정책은 `drop policy if exists` 후 다시 만든다. 데이터는 건드리지 않는다.
-- ============================================================================

-- ── 1. 표 (없을 때만 생성) ──────────────────────────────────────────────────
create table if not exists public.site_images (
  key        text        primary key,
  url        text        not null,
  updated_at timestamptz not null default now()
);

-- ── 2. RLS ──────────────────────────────────────────────────────────────────
alter table public.site_images enable row level security;

--  읽기: 누구나(비로그인 방문자 포함). 홈페이지가 그려야 한다.
drop policy if exists si_select on public.site_images;
create policy si_select on public.site_images for select
  using (true);

--  쓰기: 관리자만. 다른 정책들과 같은 기준(auth.jwt()->>'email')을 쓴다.
drop policy if exists si_insert on public.site_images;
create policy si_insert on public.site_images for insert
  with check (auth.jwt()->>'email' = 'ksb3171@gmail.com');

drop policy if exists si_update on public.site_images;
create policy si_update on public.site_images for update
  using      (auth.jwt()->>'email' = 'ksb3171@gmail.com')
  with check (auth.jwt()->>'email' = 'ksb3171@gmail.com');

drop policy if exists si_delete on public.site_images;
create policy si_delete on public.site_images for delete
  using (auth.jwt()->>'email' = 'ksb3171@gmail.com');

-- ── 3. 확인 ─────────────────────────────────────────────────────────────────
--  ① RLS 가 켜졌는가 (rls_enabled 가 true 여야 한다)
select relname, relrowsecurity as rls_enabled
  from pg_class
 where oid = 'public.site_images'::regclass;

--  ② 정책 4개가 붙었는가 (si_select · si_insert · si_update · si_delete)
select polname, polcmd
  from pg_policy
 where polrelid = 'public.site_images'::regclass
 order by polname;
