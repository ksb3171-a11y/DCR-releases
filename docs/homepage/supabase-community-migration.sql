-- ============================================================================
--  DCR site — Community boards migration (single source: website_redesign_devplan.md)
--  7 sub-boards in one generalized schema:
--    notice (admin-only write) · bug · feature (voting) · qna (answer accept)
--    · free · info · inhouse
--
--  Supersedes the single feature_requests board. Optional data migration from
--  feature_requests → community_posts(board='feature') is at the bottom (§8).
--  Idempotent: safe to re-run. Run AFTER supabase-setup.sql (needs profiles/auth).
-- ============================================================================

-- ── 1. Posts ────────────────────────────────────────────────────────────────
create table if not exists public.community_posts (
  id             uuid primary key default gen_random_uuid(),
  board          text not null
                   check (board in ('notice','bug','feature','qna','free','info','inhouse')),
  title          text not null check (char_length(title) between 2 and 160),
  body           text not null check (char_length(body) between 1 and 20000),
  author_id      uuid not null references auth.users(id) on delete cascade,
  author_name    text not null default 'Member',
  status         text,            -- bug: open/reviewing/fixed/wontfix · feature: proposed/reviewing/planned/in_progress/done/declined
  admin_reply    text,
  admin_reply_at timestamptz,
  vote_count     integer not null default 0,
  comment_count  integer not null default 0,
  view_count     integer not null default 0,
  is_pinned      boolean not null default false,   -- notice
  is_hidden      boolean not null default false,
  is_answered    boolean not null default false,   -- qna
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_cp_board   on public.community_posts(board, created_at desc);
create index if not exists idx_cp_pinned   on public.community_posts(board, is_pinned desc, created_at desc);
create index if not exists idx_cp_votes    on public.community_posts(board, vote_count desc);

-- ── 2. Comments ──────────────────────────────────────────────────────────────
create table if not exists public.community_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.community_posts(id) on delete cascade,
  author_id   uuid not null references auth.users(id) on delete cascade,
  author_name text not null default 'Member',
  body        text not null check (char_length(body) between 1 and 8000),
  is_answer   boolean not null default false,   -- qna accepted answer
  is_hidden   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_cc_post on public.community_comments(post_id, created_at);

-- ── 3. Votes (1 member / 1 post) ─────────────────────────────────────────────
create table if not exists public.community_votes (
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ── 4. Internal-write bypass flag ────────────────────────────────────────────
--  Count triggers (security definer) set this so the BEFORE-UPDATE guard does
--  not treat their vote/comment count writes as a member edit. Transaction-local.
create or replace function public._cp_bypass_on() returns void as $$
  select set_config('app.cp_bypass', 'on', true);
$$ language sql;

-- ── 5. Count / answer triggers ───────────────────────────────────────────────
create or replace function public.cp_bump_votes() returns trigger as $$
begin
  perform public._cp_bypass_on();
  if (tg_op = 'INSERT') then
    update public.community_posts set vote_count = vote_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.community_posts set vote_count = greatest(vote_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_cp_votes on public.community_votes;
create trigger trg_cp_votes
  after insert or delete on public.community_votes
  for each row execute procedure public.cp_bump_votes();

create or replace function public.cp_bump_comments() returns trigger as $$
begin
  perform public._cp_bypass_on();
  if (tg_op = 'INSERT') then
    update public.community_posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.community_posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
    -- if the accepted answer was removed, clear the answered flag
    if old.is_answer then
      update public.community_posts set is_answered = false
        where id = old.post_id
          and not exists (select 1 from public.community_comments
                          where post_id = old.post_id and is_answer = true);
    end if;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_cp_comments on public.community_comments;
create trigger trg_cp_comments
  after insert or delete on public.community_comments
  for each row execute procedure public.cp_bump_comments();

-- keep community_posts.is_answered in sync when a comment is marked/unmarked
create or replace function public.cp_sync_answer() returns trigger as $$
begin
  perform public._cp_bypass_on();
  update public.community_posts set is_answered =
    exists (select 1 from public.community_comments where post_id = new.post_id and is_answer = true)
    where id = new.post_id;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_cp_answer on public.community_comments;
create trigger trg_cp_answer
  after update of is_answer on public.community_comments
  for each row execute procedure public.cp_sync_answer();

-- ── 6. Member-edit guard: lock privileged columns for non-admins ─────────────
--  Members may edit title/body of their own post; everything else is preserved.
--  Admin (by email) and internal count writes bypass.
create or replace function public.cp_guard_update() returns trigger as $$
begin
  if coalesce(current_setting('app.cp_bypass', true), '') = 'on' then
    return new;
  end if;
  if auth.jwt()->>'email' = 'ksb3171@gmail.com' then
    new.updated_at := now();
    return new;
  end if;
  -- non-admin author edit: preserve every privileged column
  new.board          := old.board;
  new.author_id      := old.author_id;
  new.author_name    := old.author_name;
  new.status         := old.status;
  new.admin_reply    := old.admin_reply;
  new.admin_reply_at := old.admin_reply_at;
  new.vote_count     := old.vote_count;
  new.comment_count  := old.comment_count;
  new.view_count     := old.view_count;
  new.is_pinned      := old.is_pinned;
  new.is_hidden      := old.is_hidden;
  new.is_answered    := old.is_answered;
  new.created_at     := old.created_at;
  new.updated_at     := now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_cp_guard on public.community_posts;
create trigger trg_cp_guard
  before update on public.community_posts
  for each row execute procedure public.cp_guard_update();

-- ── 7. View counter (bypasses RLS so any reader can bump) ────────────────────
create or replace function public.cp_bump_view(pid uuid) returns void as $$
begin
  perform public._cp_bypass_on();
  update public.community_posts set view_count = view_count + 1 where id = pid;
end;
$$ language plpgsql security definer;
grant execute on function public.cp_bump_view(uuid) to anon, authenticated;

-- ── 8. RLS ───────────────────────────────────────────────────────────────────
alter table public.community_posts    enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_votes     enable row level security;

-- Posts: read = visible to all (hidden only to admin)
drop policy if exists cp_select on public.community_posts;
create policy cp_select on public.community_posts for select
  using (is_hidden = false or auth.jwt()->>'email' = 'ksb3171@gmail.com');

-- Posts: write = logged-in member, own row, clean counters; notice is admin-only
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
  );

-- Posts: update = author (guard locks privileged cols) or admin
drop policy if exists cp_update on public.community_posts;
create policy cp_update on public.community_posts for update
  using (auth.uid() = author_id or auth.jwt()->>'email' = 'ksb3171@gmail.com');

-- Posts: delete = author or admin
drop policy if exists cp_delete on public.community_posts;
create policy cp_delete on public.community_posts for delete
  using (auth.uid() = author_id or auth.jwt()->>'email' = 'ksb3171@gmail.com');

-- Comments
drop policy if exists cc_select on public.community_comments;
create policy cc_select on public.community_comments for select
  using (is_hidden = false or auth.jwt()->>'email' = 'ksb3171@gmail.com');

drop policy if exists cc_insert on public.community_comments;
create policy cc_insert on public.community_comments for insert
  with check (auth.uid() = author_id and is_answer = false and is_hidden = false);

-- update = comment author, parent-post author (to accept an answer), or admin
drop policy if exists cc_update on public.community_comments;
create policy cc_update on public.community_comments for update
  using (
    auth.uid() = author_id
    or auth.jwt()->>'email' = 'ksb3171@gmail.com'
    or auth.uid() = (select author_id from public.community_posts where id = post_id)
  );

drop policy if exists cc_delete on public.community_comments;
create policy cc_delete on public.community_comments for delete
  using (auth.uid() = author_id or auth.jwt()->>'email' = 'ksb3171@gmail.com');

-- Votes
drop policy if exists cv_select on public.community_votes;
create policy cv_select on public.community_votes for select using (true);
drop policy if exists cv_insert on public.community_votes;
create policy cv_insert on public.community_votes for insert with check (auth.uid() = user_id);
drop policy if exists cv_delete on public.community_votes;
create policy cv_delete on public.community_votes for delete using (auth.uid() = user_id);

-- ── 9. (OPTIONAL) migrate legacy feature_requests → community_posts ──────────
--  Uncomment to carry existing feature-board data into the 'feature' board.
--  Safe to skip if feature_requests is empty (beta).
-- insert into public.community_posts
--   (id, board, title, body, author_id, author_name, status, admin_reply,
--    admin_reply_at, vote_count, is_hidden, created_at)
-- select id, 'feature', title, body, author_id, author_name,
--        status, admin_reply, admin_reply_at, vote_count, is_hidden, created_at
-- from public.feature_requests
-- on conflict (id) do nothing;
-- -- votes:
-- insert into public.community_votes (post_id, user_id, created_at)
-- select request_id, user_id, created_at from public.feature_votes
-- on conflict (post_id, user_id) do nothing;
