-- ============================================================================
--  STRIX — 앱 오류 보고 · 비밀글 (error_report_devplan.md §4-6)
--
--  Supabase 대시보드 → SQL Editor → 이 파일 전체를 1회 실행한다. 멱등(idempotent)하다.
--  먼저 적용돼 있어야 하는 파일: supabase-community-migration.sql · -status-hardening · -answer-migration ·
--                                 -attachments-migration · -reads-migration
--
--  무엇이 바뀌나
--    ① community_posts.visibility  public(지금과 같다) · secret(비밀글) · private(자동 오류 보고 — 목록에서 숨김)
--    ② 읽기 권한 — 글·댓글·첨부 행 **셋 다** 공개 범위를 따른다(하나만 바꾸면 비밀이 샌다)
--    ③ 비밀글 목록 함수 community_post_list · 게시판별 개수 community_board_counts
--       (남의 비밀글은 🔒 한 줄 — 제목·작성자·수치를 가린 채, 숨긴 보고는 행 자체가 없다)
--    ④ 앱 보고 접수 함수 submit_error_report — 글 + 보고 상세를 한 트랜잭션에
--    ⑤ 보고 상세 표 community_post_reports · 첨부 표 community_report_files
--    ⑥ 비공개 저장소 report-files (public=false)
--
--  🚨 기존 공개 글은 동작이 그대로여야 한다 — visibility 기본값이 'public' 이고, 일반 insert 는 public 만 허용한다.
--  🚨 storage.objects 정책 생성이 SQL Editor 에서 권한 오류로 실패하면 대시보드(Storage ▸ Policies)에서 같은 식으로 만든다
--     (supabase-community-attachments-migration.sql 머리 주석과 같은 사정).
--  운영자 판정은 기존 파일과 같은 인라인 JWT 이메일 비교다.
-- ============================================================================

-- ── 1. 공개 범위 열 ─────────────────────────────────────────────────────────
alter table public.community_posts add column if not exists visibility text not null default 'public';
alter table public.community_posts drop constraint if exists community_posts_visibility_check;
alter table public.community_posts add constraint community_posts_visibility_check
  check (visibility in ('public', 'secret', 'private'));
-- 비밀·숨김은 오류제보 게시판에만 (1단계 범위 — 홈페이지 직접 글의 비밀글은 2단계, D6)
alter table public.community_posts drop constraint if exists community_posts_visibility_board_check;
alter table public.community_posts add constraint community_posts_visibility_board_check
  check (visibility = 'public' or board = 'bug');
create index if not exists idx_cp_visibility on public.community_posts(board, visibility);

-- ── 2. 가드 — 작성자는 public ↔ secret 만 바꿀 수 있다. private 는 고정(D8) ──────
--  🚨 cp_guard_update 는 열을 하나씩 되돌린다 — 새 열은 지켜 주지 못한다(answer-migration 주석).
--     그래서 이 열도 별도 트리거가 지킨다. 이름 순서상 trg_cp_guard · trg_cp_zz_answer_cols 뒤에 돈다.
create or replace function public.cp_visibility_guard() returns trigger as $$
declare
  internal boolean := coalesce(current_setting('app.cp_bypass', true), '') = 'on'
                      or coalesce(auth.role(), '') = 'service_role';
  is_admin boolean := coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com';
begin
  if internal or is_admin then return new; end if;
  if old.visibility = 'private' or new.visibility = 'private' then
    new.visibility := old.visibility;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_cp_zzz_visibility on public.community_posts;
create trigger trg_cp_zzz_visibility
  before update on public.community_posts
  for each row execute procedure public.cp_visibility_guard();

-- ── 3. 읽기 권한 — 글 ───────────────────────────────────────────────────────
drop policy if exists cp_select on public.community_posts;
create policy cp_select on public.community_posts for select
  using (
    coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com'
    or (is_hidden = false and (visibility = 'public' or author_id = auth.uid()))
  );

-- 일반 insert(홈페이지 글쓰기)는 공개 글만 — 비밀·숨김은 아래 submit_error_report 로만 들어온다.
--   나머지 조건은 supabase-community-status-hardening.sql 의 cp_insert 와 같다(이 파일이 덮어쓰므로 함께 유지).
drop policy if exists cp_insert on public.community_posts;
create policy cp_insert on public.community_posts for insert
  with check (
    auth.uid() = author_id
    and vote_count = 0 and comment_count = 0 and view_count = 0
    and admin_reply is null
    and is_hidden = false
    and is_answered = false
    and is_pinned = false
    and (board <> 'notice' or auth.jwt()->>'email' = 'ksb3171@gmail.com')
    and (status is null or status in ('open','proposed'))
    and visibility = 'public'
  );

-- ── 4. 읽기 권한 — 댓글 · 첨부 행 (부모 글을 볼 수 있을 때만) ────────────────
--  하위 질의는 호출자 권한으로 돈다 → community_posts 의 cp_select 가 그대로 적용된다.
drop policy if exists cc_select on public.community_comments;
create policy cc_select on public.community_comments for select
  using (
    coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com'
    or (is_hidden = false
        and exists (select 1 from public.community_posts p where p.id = community_comments.post_id))
  );

--  댓글 쓰기도 볼 수 있는 글에만 — 남의 비밀글 id 를 알아도 댓글을 달 수 없다.
--  나머지 조건은 supabase-community-migration.sql 의 cc_insert 와 같다(이 파일이 덮어쓰므로 함께 유지).
drop policy if exists cc_insert on public.community_comments;
create policy cc_insert on public.community_comments for insert
  with check (
    auth.uid() = author_id and is_answer = false and is_hidden = false
    and exists (select 1 from public.community_posts p where p.id = community_comments.post_id)
  );

--  초안(부모 없음)은 올린 사람 본인만 — cmUpload.js 가 편집 중 첨부·고아 정리에 쓴다
drop policy if exists ca_select on public.community_attachments;
create policy ca_select on public.community_attachments for select
  using (
    coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com'
    or auth.uid() = owner_id
    or (post_id is not null
        and exists (select 1 from public.community_posts p where p.id = community_attachments.post_id))
    or (comment_id is not null
        and exists (select 1 from public.community_comments c where c.id = community_attachments.comment_id))
  );

-- ── 5. 보고 상세 표 ─────────────────────────────────────────────────────────
create table if not exists public.community_post_reports (
  post_id       uuid primary key references public.community_posts(id) on delete cascade,
  kind          text not null check (kind in ('auto', 'manual')),
  category      text not null default 'app' check (category in ('app', 'result', 'other')),
  app_version   text not null check (char_length(app_version) between 1 and 32),
  error_name    text check (error_name is null or char_length(error_name) <= 200),
  error_message text check (error_message is null or char_length(error_message) <= 2000),
  error_stack   text check (error_stack is null or char_length(error_stack) <= 16000),
  where_        text check (where_ is null or char_length(where_) <= 200),
  fingerprint   text check (fingerprint is null or fingerprint ~ '^[0-9a-f]{8,64}$'),
  env           jsonb not null default '{}'::jsonb check (pg_column_size(env) <= 16384),
  created_at    timestamptz not null default now()
);
create index if not exists idx_cpr_fingerprint on public.community_post_reports(fingerprint);

alter table public.community_post_reports enable row level security;
revoke all on public.community_post_reports from anon;

drop policy if exists cpr_select on public.community_post_reports;
create policy cpr_select on public.community_post_reports for select
  using (
    coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com'
    or exists (select 1 from public.community_posts p
                where p.id = community_post_reports.post_id and p.author_id = auth.uid())
  );
-- insert 정책 없음 — submit_error_report(정의자 권한)만 넣는다. update/delete 는 운영자만.
drop policy if exists cpr_update on public.community_post_reports;
create policy cpr_update on public.community_post_reports for update
  using (coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com');
drop policy if exists cpr_delete on public.community_post_reports;
create policy cpr_delete on public.community_post_reports for delete
  using (coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com');

-- ── 6. 첨부 표 (비공개 저장소의 객체 목록) ───────────────────────────────────
--  community_attachments 는 재사용하지 않는다 — 공개 버킷 둘만 허용하는 CHECK · `<uid>/<파일>` 한 단계 경로 ·
--  공개 url 필수가 맞지 않는다. 넓히면 기존 첨부 규칙이 약해진다(error_report_devplan.md §4-6).
create table if not exists public.community_report_files (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  owner_id   uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('screenshot', 'log', 'report', 'model', 'extra')),
  path       text not null unique
               check (path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[A-Za-z0-9][A-Za-z0-9._-]{0,99}$'),
  name       text not null check (char_length(name) between 1 and 200),
  mime       text not null check (char_length(mime) <= 100),
  bytes      bigint not null check (bytes > 0 and bytes <= 52428800),
  purged_at  timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_crf_post on public.community_report_files(post_id);

alter table public.community_report_files enable row level security;
revoke all on public.community_report_files from anon;

drop policy if exists crf_select on public.community_report_files;
create policy crf_select on public.community_report_files for select
  using (coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com' or auth.uid() = owner_id);

--  본인 글에, 본인 폴더 경로로, 글당 10행까지, 글을 쓴 지 1시간 안에만
drop policy if exists crf_insert on public.community_report_files;
create policy crf_insert on public.community_report_files for insert
  with check (
    auth.uid() = owner_id
    and split_part(path, '/', 1) = auth.uid()::text
    and split_part(path, '/', 2) = post_id::text
    and purged_at is null
    and exists (select 1 from public.community_posts p
                 where p.id = post_id and p.author_id = auth.uid()
                   and p.created_at > now() - interval '1 hour')
    and (select count(*) from public.community_report_files f where f.post_id = community_report_files.post_id) < 10
  );
drop policy if exists crf_update on public.community_report_files;
create policy crf_update on public.community_report_files for update
  using (coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com');
drop policy if exists crf_delete on public.community_report_files;
create policy crf_delete on public.community_report_files for delete
  using (coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com');

-- ── 7. 앱 보고 접수 ─────────────────────────────────────────────────────────
--  🚨 security definer 는 RLS·cp_insert 를 **우회한다** → 같은 조건을 여기서 다시 강제한다.
--     author_id 는 인자로 받지 않는다(auth.uid() 만).
create or replace function public.submit_error_report(
  p_kind          text,
  p_visibility    text,
  p_category      text,
  p_title         text,
  p_body          text,
  p_app_version   text,
  p_error_name    text,
  p_error_message text,
  p_error_stack   text,
  p_where         text,
  p_fingerprint   text,
  p_env           jsonb
) returns uuid as $$
declare
  uid      uuid := auth.uid();
  is_admin boolean := coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com';
  vis      text;
  pname    text;
  pid      uuid;
begin
  if uid is null then raise exception 'ER_AUTH'; end if;
  if p_kind not in ('auto', 'manual') then raise exception 'ER_KIND'; end if;
  -- 자동 보고는 항상 숨김(U8). 수동은 공개/비밀만(U7)
  vis := case when p_kind = 'auto' then 'private'
              when p_visibility in ('public', 'secret') then p_visibility
              else null end;
  if vis is null then raise exception 'ER_VISIBILITY'; end if;
  if p_category not in ('app', 'result', 'other') then raise exception 'ER_CATEGORY'; end if;

  -- 레이트 — 시간 10건 · 하루 30건(운영자 면제)
  if not is_admin then
    if (select count(*) from public.community_posts p join public.community_post_reports r on r.post_id = p.id
         where p.author_id = uid and p.created_at > now() - interval '1 hour') >= 10
       or (select count(*) from public.community_posts p join public.community_post_reports r on r.post_id = p.id
         where p.author_id = uid and p.created_at > now() - interval '1 day') >= 30 then
      raise exception 'ER_RATE_LIMIT';
    end if;
  end if;

  select coalesce(nullif(btrim(pr.name), ''), split_part(pr.email, '@', 1), 'Member') into pname
    from public.profiles pr where pr.id = uid;

  insert into public.community_posts (board, title, body, author_id, author_name, status, visibility)
  -- 제목 2~160자 · 본문 1~20000자 CHECK — 앱이 비워 보내도 접수는 되게(앱은 언어별 기본 문구를 채워 보낸다)
  values ('bug',
          left(case when char_length(btrim(coalesce(p_title, ''))) >= 2 then btrim(p_title) else 'App error' end, 160),
          left(coalesce(nullif(btrim(p_body), ''), '-'), 20000),
          uid, coalesce(pname, 'Member'), 'open', vis)
  returning id into pid;

  insert into public.community_post_reports
    (post_id, kind, category, app_version, error_name, error_message, error_stack, where_, fingerprint, env)
  values
    (pid, p_kind, p_category, left(p_app_version, 32), left(p_error_name, 200), left(p_error_message, 2000),
     left(p_error_stack, 16000), left(p_where, 200), nullif(p_fingerprint, ''), coalesce(p_env, '{}'::jsonb));

  return pid;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function public.submit_error_report(text, text, text, text, text, text, text, text, text, text, text, jsonb) from public, anon;
grant execute on function public.submit_error_report(text, text, text, text, text, text, text, text, text, text, text, jsonb) to authenticated;

-- ── 8. 비밀글 목록 · 개수 (홈페이지가 부른다) ───────────────────────────────
--  남의 비밀글 = id·board·created_at·is_pinned 만 남기고 가린다. 숨긴 보고 = 행 없음. 운영자 = 전부.
--  화면 문구(「🔒 비공개 글입니다」)는 홈페이지가 언어별로 그린다 — 여기서는 is_locked 만 준다.
create or replace function public.community_post_list(p_board text, p_by_votes boolean default false)
returns table (
  id uuid, board text, title text, body text, author_name text, status text,
  vote_count integer, comment_count integer, view_count integer,
  is_pinned boolean, is_hidden boolean, is_answered boolean, admin_reply text,
  created_at timestamptz, visibility text, is_locked boolean, is_mine boolean
) as $$
  with me as (
    select auth.uid() as uid, coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com' as admin
  )
  select
    p.id, p.board,
    case when lk.locked then '' else p.title end,
    case when lk.locked then '' else p.body end,
    case when lk.locked then '' else p.author_name end,
    case when lk.locked then null else p.status end,
    case when lk.locked then 0 else p.vote_count end,
    case when lk.locked then 0 else p.comment_count end,
    case when lk.locked then 0 else p.view_count end,
    p.is_pinned,
    p.is_hidden,
    case when lk.locked then false else p.is_answered end,
    case when lk.locked then null else p.admin_reply end,
    p.created_at, p.visibility, lk.locked,
    (p.author_id = me.uid)
  from public.community_posts p
  cross join me
  cross join lateral (
    select (p.visibility = 'secret' and not me.admin and p.author_id is distinct from me.uid) as locked
  ) lk
  where p.board = p_board
    and (me.admin or p.is_hidden = false)
    and (me.admin or p.visibility <> 'private' or p.author_id = me.uid)
  order by p.is_pinned desc,
           case when p_by_votes then p.vote_count end desc nulls last,
           p.created_at desc
  limit 500;
$$ language sql security definer stable set search_path = public;

revoke all on function public.community_post_list(text, boolean) from public;
grant execute on function public.community_post_list(text, boolean) to anon, authenticated;

create or replace function public.community_board_counts()
returns table (board text, n integer) as $$
  select p.board, count(*)::int
    from public.community_posts p
   where (coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com')
      or (p.is_hidden = false and (p.visibility <> 'private' or p.author_id = auth.uid()))
   group by p.board;
$$ language sql security definer stable set search_path = public;

revoke all on function public.community_board_counts() from public;
grant execute on function public.community_board_counts() to anon, authenticated;

-- ── 9. 비공개 저장소 report-files ───────────────────────────────────────────
--  🚨 public=false 필수 — 공개 버킷은 /object/public/ 경로가 아래 정책을 우회한다.
--  파일당 50 MB(D2). Supabase 프로젝트 전역 상한이 더 작으면 그것이 이긴다(대시보드 ▸ Storage ▸ Settings 확인).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-files', 'report-files', false, 52428800, null)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists rf_obj_insert on storage.objects;
create policy rf_obj_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'report-files'
    and (storage.foldername(name))[1] = auth.uid()::text
    and lower(storage.extension(name)) in
        ('png','json','log','dcr','dxf','dwg','mgt','xlsx','xls','csv','pdf','jpg','jpeg','txt','at2','acc')
  );

drop policy if exists rf_obj_select on storage.objects;
create policy rf_obj_select on storage.objects for select
  using (
    bucket_id = 'report-files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com'
    )
  );

drop policy if exists rf_obj_delete on storage.objects;
create policy rf_obj_delete on storage.objects for delete
  using (bucket_id = 'report-files' and coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com');

-- ── 10. 확인 ────────────────────────────────────────────────────────────────
--  ① 열·제약
select column_name, column_default from information_schema.columns
 where table_schema = 'public' and table_name = 'community_posts' and column_name = 'visibility';
--  ② 버킷이 비공개인가 (public 이 false 여야 한다)
select id, public, file_size_limit from storage.buckets where id = 'report-files';
--  ③ 정책이 다 붙었는가 (8행 이상이어야 한다)
select tablename, policyname from pg_policies
 where policyname in ('cp_select','cp_insert','cc_select','cc_insert','ca_select','cpr_select','crf_select','crf_insert',
                      'rf_obj_insert','rf_obj_select','rf_obj_delete')
 order by tablename, policyname;
--  ④ 기존 글이 전부 public 인가
select visibility, count(*) from public.community_posts group by visibility;
