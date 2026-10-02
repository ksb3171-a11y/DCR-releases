-- ============================================================================
--  STRIX — 커뮤니티 답변 알림 (오류제보 · 기능개선 · 질의응답)
--  단일 원천: qna_inbox_devplan.md §8 (community_answer_notify_devplan.md 흡수)
--
--  Supabase 대시보드 → SQL Editor → 이 파일 전체를 1회 실행한다. 멱등(idempotent)하다.
--
--  「운영자가 답했다」를 **서버가** 정한다 — 클라이언트 시계·저장 버튼과 무관하다.
--    staff_answered_at  첫 운영자 답변 시각. 공식 답변칸(admin_reply)이 채워지거나 운영자 계정이 댓글을 달 때
--    answer_mailed_at   글쓴이에게 메일을 보낸 시각. 메일 함수(service role)만 쓴다. 성공했을 때만
--                       ⚠ 2026-10-02 사용자 결정으로 **메일 발송은 하지 않는다**(앱 🔔 배지만). 열은 적용돼 있어 남겨 둔다 —
--                       가드가 지키므로 해가 없고, 다시 메일을 켤 때 그대로 쓴다(qna_inbox_devplan.md §8)
--  두 열은 일반 회원도 **운영자 JWT 도** 직접 못 바꾼다(아래 가드). 바꾸는 것은 트리거와 service role 뿐이다.
-- ============================================================================

-- ── 1. 열 ───────────────────────────────────────────────────────────────────
alter table public.community_posts add column if not exists staff_answered_at timestamptz;
alter table public.community_posts add column if not exists answer_mailed_at  timestamptz;
create index if not exists idx_cp_answer_mail on public.community_posts(staff_answered_at)
  where answer_mailed_at is null;

-- ── 2. 운영자 계정인가 (user id 기준) ───────────────────────────────────────
--  자동 게시(service role)는 운영자 user id 로 댓글을 쓴다 — 그래서 JWT 가 아니라 작성자 id 로 판정한다.
create or replace function public._is_staff_user(uid uuid) returns boolean as $$
  select exists (select 1 from auth.users u where u.id = uid and lower(u.email) = 'ksb3171@gmail.com');
$$ language sql security definer stable set search_path = public, auth;
revoke all on function public._is_staff_user(uuid) from public, anon, authenticated;

-- ── 3. 두 열 가드 + 공식 답변칸 기록 ────────────────────────────────────────
--  🚨 기존 cp_guard_update 는 열을 하나씩 나열해 되돌린다 — **새 열은 지켜 주지 못한다.**
--     그래서 이 두 열은 별도 트리거가 지킨다. 이름이 trg_cp_guard 보다 뒤라 그 다음에 돈다
--     (같은 시점 트리거는 이름순) → 일반 회원이 바꾼 admin_reply 는 이미 되돌려진 뒤에 본다.
create or replace function public.cp_answer_cols_guard() returns trigger as $$
declare
  internal boolean := coalesce(current_setting('app.cp_bypass', true), '') = 'on'
                      or coalesce(auth.role(), '') = 'service_role';
begin
  if tg_op = 'INSERT' then
    if not internal then
      new.staff_answered_at := null;
      new.answer_mailed_at  := null;
    end if;
    return new;
  end if;

  if not internal then
    new.staff_answered_at := old.staff_answered_at;
    new.answer_mailed_at  := old.answer_mailed_at;
  end if;

  -- 공식 답변칸이 채워지면 첫 답변 시각을 찍는다(첫 값 유지 — 메일 1회의 기준)
  if new.staff_answered_at is null
     and coalesce(btrim(new.admin_reply), '') <> ''
     and new.board in ('qna', 'bug', 'feature')
     and not public._is_staff_user(new.author_id) then
    new.staff_answered_at := now();
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;
-- 🚨 security definer 필수 — 회원 권한으로 돌면 막아 둔 _is_staff_user 를 못 불러 **회원의 글 수정이 전부 오류**가 난다.
--    auth.role()·current_setting 은 요청 설정을 읽으므로 정의자 권한에서도 호출자 판정이 그대로다.

drop trigger if exists trg_cp_zz_answer_cols on public.community_posts;
create trigger trg_cp_zz_answer_cols
  before insert or update on public.community_posts
  for each row execute procedure public.cp_answer_cols_guard();

-- ── 4. 운영자 계정 댓글 = 답변 ──────────────────────────────────────────────
--  홈페이지 댓글 · 앱 Q&A Inbox 승인 게시 · 서버 자동 게시(STRIX AI) 모두 운영자 user id 로 달린다.
create or replace function public.cp_answer_on_staff_comment() returns trigger as $$
begin
  if public._is_staff_user(new.author_id) then
    perform public._cp_bypass_on();
    update public.community_posts p
       set staff_answered_at = now()
     where p.id = new.post_id
       and p.staff_answered_at is null
       and p.board in ('qna', 'bug', 'feature')
       and not public._is_staff_user(p.author_id);
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_cc_staff_answer on public.community_comments;
create trigger trg_cc_staff_answer
  after insert on public.community_comments
  for each row execute procedure public.cp_answer_on_staff_comment();

-- ── 5. 기존 글 채우기 — 이미 답한 글에 메일이 한꺼번에 나가지 않게 ──────────
--  답한 시각을 모르면 글 작성 시각을 쓰고, answer_mailed_at 도 같이 채워 **메일 대상에서 뺀다.**
--  🚨 우회 플래그는 트랜잭션 안에서만 산다 — 그래서 DO 블록 하나에서 켜고 바로 쓴다.
do $$
begin
  perform public._cp_bypass_on();
  update public.community_posts p
     set staff_answered_at = coalesce(
           (select min(c.created_at) from public.community_comments c
             where c.post_id = p.id and public._is_staff_user(c.author_id)),
           p.admin_reply_at, p.created_at),
         answer_mailed_at = now()
   where p.staff_answered_at is null
     and p.board in ('qna', 'bug', 'feature')
     and not public._is_staff_user(p.author_id)
     and (coalesce(btrim(p.admin_reply), '') <> ''
          or exists (select 1 from public.community_comments c
                      where c.post_id = p.id and public._is_staff_user(c.author_id)));
end $$;

-- ── 6. 글쓴이 배지 (앱이 부른다) ────────────────────────────────────────────
--  "내 글 중 운영자 답변이 달렸는데 아직 안 열어 본 글" — 오래된 순. 앱 🔔 = 개수, 누르면 첫 글을 연다.
--  홈페이지에서 그 글을 열면(cp_mark_read) 목록에서 빠진다.
--  SECURITY INVOKER + auth.uid() — 남의 글은 볼 수 없다. 숨김 글은 RLS(cp_select)가 이미 뺀다.
drop function if exists public.my_answer_unread_count();
create or replace function public.my_answer_unread()
  returns table (post_id uuid, board text, title text, answered_at timestamptz) as $$
  select p.id, p.board, p.title, p.staff_answered_at
  from public.community_posts p
  left join public.community_reads r on r.post_id = p.id and r.user_id = auth.uid()
  where p.author_id = auth.uid()
    and p.board in ('qna', 'bug', 'feature')
    and p.staff_answered_at is not null
    and p.staff_answered_at > coalesce(r.read_at, '-infinity'::timestamptz)
  order by p.staff_answered_at asc
  limit 100;
$$ language sql security invoker stable;
revoke all on function public.my_answer_unread() from public, anon;
grant execute on function public.my_answer_unread() to authenticated;

-- ── 확인 ────────────────────────────────────────────────────────────────────
select 'trigger ' || tgname as item, 'ok' as value
  from pg_trigger where tgname in ('trg_cp_zz_answer_cols', 'trg_cc_staff_answer')
union all
select 'answered posts', count(*)::text from public.community_posts
 where board in ('qna','bug','feature') and staff_answered_at is not null
union all
select 'mail queue (should be 0)', count(*)::text from public.community_posts
 where staff_answered_at is not null and answer_mailed_at is null;
