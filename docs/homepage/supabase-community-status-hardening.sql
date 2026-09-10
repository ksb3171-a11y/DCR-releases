-- ============================================================================
--  STRIX site — community_posts.status hardening   (SEC-04b)
--  단일 원천: security_hardening_devplan.md §5 SEC-04b · §7 단계 4
--
--  Supabase 대시보드 → SQL Editor → 이 파일 전체를 복사해 1회 실행한다.
--  멱등(idempotent)하다 — 여러 번 돌려도 안전하다.
--
--  ── 무엇을 고치는가 ────────────────────────────────────────────────────────
--  `community_posts.status` 는 화면에서 **class 속성 안**으로 들어간다:
--
--      <span class="cm-badge st-{status}">
--
--  그런데 스키마가 `status text,` 뿐이라 **CHECK 제약이 없고**, 회원 INSERT 를
--  통제하는 `cp_insert` 정책도 status 를 고정하지 않는다. 가드 트리거
--  `trg_cp_guard` 는 `before update` 전용이라 **INSERT 를 전혀 보지 않는다.**
--  즉 로그인 회원이 REST 로 글을 쓰면서 status 에 아무 문자열이나 넣을 수 있었다.
--
--  🚨 화면(docs/js/community.js)의 화이트리스트 매핑만으로 끝내지 않는 이유:
--     오염된 값이 DB 에 남아 있으면 **다른 화면·다른 도구·나중에 추가될 코드**에서
--     되살아난다. 화면 수리는 이미 있는 값을 못 지운다. 여기가 진짜 수리다.
--
--  ── 선례 ───────────────────────────────────────────────────────────────────
--  구버전 `feature_requests` 는 이걸 제대로 했다 (supabase-setup.sql:71) —
--      status text not null default 'proposed'
--        check (status in ('proposed','reviewing','planned','in_progress','done','declined'))
--    + fr_insert 정책이 `status = 'proposed'` 로 고정
--  일반화하면서 이 두 겹이 함께 사라진 것이다. 되돌린다.
-- ============================================================================

-- ── 1. 이미 들어와 있는 오염값 정리 ─────────────────────────────────────────
--  가드 트리거가 `before update` 에서 status 를 옛 값으로 되돌리므로, 같은 트랜잭션
--  안에서 우회 플래그를 켜고 지운다(SQL Editor 는 auth.jwt() 가 없어 관리자로 인정되지 않는다).
do $$
declare
  fixed integer;
begin
  perform public._cp_bypass_on();
  update public.community_posts
     set status = null
   where status is not null
     and status not in ('open','reviewing','fixed','wontfix',
                        'proposed','planned','in_progress','done','declined');
  get diagnostics fixed = row_count;
  raise notice 'community_posts.status 정리: %건을 null 로 되돌렸다', fixed;
end $$;

-- ── 2. 컬럼 CHECK — 이게 진짜 방벽이다 ──────────────────────────────────────
--  값 목록은 docs/js/community.js 의 STATUS 상수와 같아야 한다.
--    bug     : open · reviewing · fixed · wontfix
--    feature : proposed · reviewing · planned · in_progress · done · declined
--  다른 게시판(notice/qna/free/info/inhouse)은 status 를 쓰지 않으므로 null 을 허용한다.
alter table public.community_posts
  drop constraint if exists community_posts_status_check;
alter table public.community_posts
  add constraint community_posts_status_check
  check (status is null or status in ('open','reviewing','fixed','wontfix',
                                      'proposed','planned','in_progress','done','declined'));

-- ── 3. INSERT 정책에도 같은 조건 ────────────────────────────────────────────
--  CHECK 만으로도 막히지만, 정책에 적어 두면 "왜 거부됐는가" 가 정책 위반으로 드러나고
--  나중에 CHECK 를 손대는 사람에게 의도가 남는다. 나머지 조건은 원본과 동일하다
--  (supabase-community-migration.sql §8) — 이 파일이 정책을 덮어쓰므로 함께 유지한다.
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
    -- ★ SEC-04b: 새 글은 게시판의 초기 상태이거나 비어 있어야 한다.
    and (status is null or status in ('open','proposed'))
  );

-- ── 4. 확인 ─────────────────────────────────────────────────────────────────
--  ① 남아 있는 status 값이 전부 허용 목록 안인지
select status, count(*) as n
  from public.community_posts
 group by status
 order by n desc;

--  ② 제약이 실제로 걸렸는지 (0건이면 제약이 안 붙은 것이다)
select conname, pg_get_constraintdef(oid) as def
  from pg_constraint
 where conrelid = 'public.community_posts'::regclass
   and conname = 'community_posts_status_check';

-- ③ 음성 대조군 — 아래를 일부러 돌려 **거부되는지** 확인하고 싶다면 (로그인 세션에서):
--    insert into public.community_posts (board,title,body,author_id,status)
--    values ('bug','probe','probe', auth.uid(), '"><img src=x onerror=alert(1)>');
--    → new row for relation "community_posts" violates check constraint 가 나와야 정상이다.
