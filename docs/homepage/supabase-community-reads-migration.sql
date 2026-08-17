-- ============================================================================
--  STRIX site — Community read-state migration (unread badge)
--  Single source: community_badge_devplan.md
--
--  Adds per-member read state so the desktop app can show a "new posts" badge
--  that goes DOWN as the reader actually reads:
--    · public.community_reads            — one row per (member, post), read_at
--    · cp_mark_read(uuid)                — called by the website when a post
--                                          detail is opened (next to cp_bump_view)
--    · community_unread_count()          — the ONLY place the badge number is
--                                          defined. The app just reads the int.
--
--  Read state is per POST, not per comment: opening a post shows all of its
--  comments on one screen, so a single read_at means "I have seen this post up
--  to this moment". A comment posted after read_at makes the post unread again.
--
--  Both functions are SECURITY INVOKER on purpose — RLS then applies, so
--  hidden posts are counted for the admin only and every other member sees
--  exactly their own visible set. No email check is needed here.
--
--  Idempotent: safe to re-run.
--  Run AFTER supabase-setup.sql and supabase-community-migration.sql.
-- ============================================================================

-- ── 1. Read state ───────────────────────────────────────────────────────────
create table if not exists public.community_reads (
  user_id uuid        not null references auth.users(id)             on delete cascade,
  post_id uuid        not null references public.community_posts(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index if not exists idx_cr_user on public.community_reads(user_id, read_at desc);

alter table public.community_reads enable row level security;

-- A member may only ever see and write their own read marks.
drop policy if exists cr_own on public.community_reads;
create policy cr_own on public.community_reads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 2. Mark a post read (website calls this) ─────────────────────────────────
--  SECURITY INVOKER + auth.uid() as the row key: the caller cannot mark a post
--  read on someone else's behalf, because user_id is never taken from the client.
--
--  Anonymous visitors can open a post detail too. auth.uid() is then null and a
--  plain insert would fail the not-null constraint, so return quietly instead —
--  the website calls this on every post open and must never see an error.
create or replace function public.cp_mark_read(pid uuid) returns void as $$
begin
  if auth.uid() is null then return; end if;
  insert into public.community_reads (user_id, post_id, read_at)
  values (auth.uid(), pid, now())
  on conflict (user_id, post_id) do update set read_at = now();
end;
$$ language plpgsql security invoker;

grant execute on function public.cp_mark_read(uuid) to authenticated;

-- ── 3. Badge number (app calls this) ────────────────────────────────────────
--  Definition: "how many posts do I still have to open".
--    · a post I have never opened, written by someone else   → 1
--    · a post whose comments grew since I last opened it     → 1
--  Opening one post therefore lowers the number by exactly one, which is what
--  makes the badge feel honest.
--
--  🚨 The two halves are judged INDEPENDENTLY on purpose. Excluding my own
--     posts wholesale (`p.author_id <> auth.uid() and (...)`) would silently
--     hide every comment left on a notice the admin wrote — the admin would
--     never learn about replies to their own posts.
create or replace function public.community_unread_count() returns integer as $$
  select count(*)::int
  from public.community_posts p
  left join public.community_reads r
         on r.post_id = p.id
        and r.user_id = auth.uid()
  where (p.author_id <> auth.uid() and r.read_at is null)
     or exists (
          select 1
          from public.community_comments c
          where c.post_id    = p.id
            and c.author_id <> auth.uid()
            and c.created_at > coalesce(r.read_at, '-infinity'::timestamptz)
        );
$$ language sql security invoker stable;

grant execute on function public.community_unread_count() to authenticated;

-- ── 4. (P5, not enabled yet) realtime publication ───────────────────────────
--  The badge currently refreshes on a schedule (09/13/17), at app start, and
--  when the app window regains focus. Live push is an optional later phase:
--  the app's Supabase client sets autoRefreshToken:false on purpose, so a
--  long-lived realtime socket can lose its JWT and die quietly. Enable this
--  only together with the fallback-demotion logic described in the devplan §4.
--
--  alter publication supabase_realtime add table public.community_posts;
--  alter publication supabase_realtime add table public.community_comments;
