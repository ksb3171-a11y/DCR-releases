-- ============================================================================
--  STRIX site — 댓글 컬럼 가드   (SEC-13)
--  단일 원천: security_hardening_devplan.md §5 SEC-13 · P2 묶음
--
--  Supabase 대시보드 → SQL Editor → 이 파일 전체를 복사해 1회 실행한다.
--  멱등(idempotent)하다 — 여러 번 돌려도 안전하다.
--
--  ── 무엇을 고치는가 ────────────────────────────────────────────────────────
--  `cc_update` 정책은 **글 작성자**에게도 댓글 UPDATE 를 허용한다:
--
--      create policy cc_update on public.community_comments for update
--        using ( auth.uid() = author_id                      -- 댓글 작성자
--                or auth.jwt()->>'email' = '…'               -- 관리자
--                or auth.uid() = (select author_id from community_posts where id = post_id) )
--
--  의도는 "질문자가 **답변 채택**(is_answer)을 할 수 있게" 하는 것이다. 그런데 **RLS 는 행 단위**라
--  컬럼을 가리지 못한다 → 글 작성자가 **남의 댓글 본문을 통째로 고쳐 쓸 수 있다.**
--  게시글(`community_posts`)에는 이미 같은 목적의 가드 트리거(`cp_guard_update`)가 있는데
--  **댓글에만 없었다.** 같은 형태로 채운다.
--
--  ⚠️ 정책은 건드리지 않는다 — 채택 기능이 살아 있어야 한다.
--     트리거가 **바꿔도 되는 컬럼만** 통과시킨다.
-- ============================================================================

create or replace function public.cc_guard_update() returns trigger as $$
begin
  -- 내부 쓰기(집계 트리거 등)는 그대로 통과. cp_guard_update 와 같은 우회 플래그를 쓴다.
  if coalesce(current_setting('app.cp_bypass', true), '') = 'on' then
    return new;
  end if;

  -- 관리자: 전부 허용
  if auth.jwt()->>'email' = 'ksb3171@gmail.com' then
    return new;
  end if;

  -- 댓글 작성자 본인: **본문만** 고칠 수 있다. 나머지는 옛 값으로 되돌린다.
  if auth.uid() = old.author_id then
    new.post_id     := old.post_id;
    new.author_id   := old.author_id;
    new.author_name := old.author_name;
    new.is_answer   := old.is_answer;   -- 자기 댓글을 스스로 "채택"할 수 없다
    new.is_hidden   := old.is_hidden;
    new.created_at  := old.created_at;
    return new;
  end if;

  -- 그 밖(= 정책이 허용하는 유일한 나머지: **글 작성자**): 채택 여부만 바꿀 수 있다.
  --   🚨 여기가 SEC-13 이다. 종전에는 본문까지 덮어쓸 수 있었다.
  new.body        := old.body;
  new.post_id     := old.post_id;
  new.author_id   := old.author_id;
  new.author_name := old.author_name;
  new.is_hidden   := old.is_hidden;
  new.created_at  := old.created_at;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_cc_guard on public.community_comments;
create trigger trg_cc_guard
  before update on public.community_comments
  for each row execute procedure public.cc_guard_update();

-- ── 확인 ────────────────────────────────────────────────────────────────────
--  ① 트리거가 붙었는가 (1행이 나와야 한다)
select tgname, tgenabled
  from pg_trigger
 where tgrelid = 'public.community_comments'::regclass
   and tgname  = 'trg_cc_guard';

--  ② 게시글 쪽 가드와 나란히 있는가 (2행: trg_cp_guard · trg_cc_guard)
select c.relname, t.tgname
  from pg_trigger t join pg_class c on c.oid = t.tgrelid
 where t.tgname in ('trg_cp_guard', 'trg_cc_guard')
 order by c.relname;

-- ③ 음성 대조군 — 다른 사람 계정으로 남의 댓글 본문을 고쳐 보면 **값이 안 바뀌어야** 한다:
--    update public.community_comments set body = 'HACKED' where id = '<남의 댓글 id>';
--    → 오류는 안 나지만(정책이 행을 허용하므로) body 는 그대로다. 그게 이 트리거의 동작이다.
