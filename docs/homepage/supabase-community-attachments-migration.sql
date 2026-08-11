-- ============================================================================
--  STRIX site — Community attachments migration (images + files)
--  Single source: community_image_upload_devplan.md
--
--  Adds image paste/upload AND general file attachments to the community boards:
--    · bucket `community`       — inline images. 5 MB, image mime types only
--    · bucket `community-files` — downloadable files. 20 MB, extension allowlist
--    · storage.objects RLS — a member may only write into <own uid>/...
--    · public.community_attachments — one row per uploaded object
--    · guard trigger      — privileged columns immutable, parent claimed once
--                           and only for a post/comment you authored
--    · rate limit trigger — 30 uploads / hour / member
--    · ca_list_orphans() / ca_all_paths() — admin sweep helpers
--
--  Two buckets, on purpose: the renderer only ever turns URLs under the IMAGE
--  bucket prefix into <img>. A file can therefore never be rendered as an image,
--  no matter what a crafted post body says.
--
--  Idempotent: safe to re-run.
--  Run AFTER supabase-setup.sql and supabase-community-migration.sql.
--
--  NOTE  The storage.* statements need the `postgres` role (Supabase SQL
--        Editor default). If one fails with "must be owner of table objects",
--        create that single policy from Storage ▸ Policies in the dashboard —
--        the expressions below are copy-paste ready.
-- ============================================================================

-- ── 1. Buckets ──────────────────────────────────────────────────────────────
--  file_size_limit / allowed_mime_types are enforced by the Storage API itself.
--  This is the real defence line — client-side checks are bypassable.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community', 'community', true, 5242880,
  array['image/png','image/jpeg','image/webp','image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

--  Files arrive as application/octet-stream, application/x-zip-compressed, ''
--  and a dozen other spellings depending on the OS, so a mime allowlist is not
--  workable here. The extension allowlist in the INSERT policy below is the
--  server-side equivalent, and it is what keeps .html/.svg/.exe out.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-files', 'community-files', true, 20971520, null)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── 2. storage.objects RLS ──────────────────────────────────────────────────
--  RLS on storage.objects is already enabled by Supabase; do NOT `alter table`
--  it here (the SQL Editor role is not its owner and the statement fails).
--
--  Serving a public object does NOT go through these policies — /object/public/
--  is unauthenticated. These govern the authenticated API only (upload / delete
--  / list), so listing is restricted to the owner and the admin: anonymous
--  visitors cannot enumerate the buckets.
drop policy if exists ca_obj_select on storage.objects;
create policy ca_obj_select on storage.objects for select
  using (
    bucket_id in ('community', 'community-files')
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com'
    )
  );

-- images: logged-in member, own uid folder, image extension
drop policy if exists ca_obj_insert on storage.objects;
create policy ca_obj_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'community'
    and (storage.foldername(name))[1] = auth.uid()::text
    and lower(substring(name from '\.([A-Za-z0-9]+)$'))
        = any (array['png','jpg','jpeg','webp','gif'])
  );

-- files: logged-in member, own uid folder, allowlisted extension.
--  Deliberately excludes html/htm/svg/xml (stored XSS on the storage origin)
--  and every executable/script form (exe/dll/bat/cmd/ps1/js/vbs/scr/msi/jar/sh).
drop policy if exists ca_fobj_insert on storage.objects;
create policy ca_fobj_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'community-files'
    and (storage.foldername(name))[1] = auth.uid()::text
    and lower(substring(name from '\.([A-Za-z0-9]+)$')) = any (array[
      'pdf','zip','7z','gz','rar',
      'csv','txt','log','md','json',
      'xlsx','xls','docx','doc','pptx','ppt','hwp','hwpx',
      'dwg','dxf',
      'dcr','mgt','at2','out','tcl','inp','s2k','e2k',
      'png','jpg','jpeg','webp','gif'
    ])
  );

drop policy if exists ca_obj_update on storage.objects;
create policy ca_obj_update on storage.objects for update to authenticated
  using (
    bucket_id in ('community', 'community-files')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id in ('community', 'community-files')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists ca_obj_delete on storage.objects;
create policy ca_obj_delete on storage.objects for delete to authenticated
  using (
    bucket_id in ('community', 'community-files')
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com'
    )
  );

-- ── 3. Attachment rows ──────────────────────────────────────────────────────
create table if not exists public.community_attachments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references public.community_posts(id)    on delete cascade,
  comment_id uuid references public.community_comments(id) on delete cascade,
  owner_id   uuid not null references auth.users(id) on delete cascade,
  kind       text not null default 'image',
  bucket     text not null default 'community',
  path       text not null unique,
  url        text not null,
  name       text,
  mime       text not null,
  bytes      integer not null check (bytes > 0),
  width      integer,
  height     integer,
  created_at timestamptz not null default now(),
  constraint ca_one_parent  check (num_nonnulls(post_id, comment_id) <= 1),
  constraint ca_kind        check (kind in ('image', 'file')),
  constraint ca_kind_bucket check (
    (kind = 'image' and bucket = 'community') or
    (kind = 'file'  and bucket = 'community-files')
  ),
  -- `<uuid>/<filename>` only: no traversal, no scheme, no query string.
  constraint ca_path_shape  check (path ~ '^[A-Za-z0-9][A-Za-z0-9_-]*/[A-Za-z0-9._-]+$')
);

-- upgrade path for anyone who ran an earlier revision of this file
alter table public.community_attachments add column if not exists kind   text not null default 'image';
alter table public.community_attachments add column if not exists bucket text not null default 'community';
alter table public.community_attachments add column if not exists name   text;

create index if not exists idx_ca_post    on public.community_attachments(post_id);
create index if not exists idx_ca_comment on public.community_attachments(comment_id);
create index if not exists idx_ca_owner   on public.community_attachments(owner_id, created_at desc);
create index if not exists idx_ca_draft   on public.community_attachments(created_at)
  where post_id is null and comment_id is null;

-- ── 4. Guard: privileged columns immutable, parent claimed once & only mine ──
--  Without this, a member could repoint their own attachment row at SOMEONE
--  ELSE's post — RLS alone would not stop it, because the row is theirs.
create or replace function public.ca_guard_update() returns trigger as $$
declare
  is_admin      boolean := coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com';
  parent_author uuid;
begin
  -- these never change, for anyone
  new.id         := old.id;
  new.owner_id   := old.owner_id;
  new.kind       := old.kind;
  new.bucket     := old.bucket;
  new.path       := old.path;
  new.url        := old.url;
  new.name       := old.name;
  new.mime       := old.mime;
  new.bytes      := old.bytes;
  new.width      := old.width;
  new.height     := old.height;
  new.created_at := old.created_at;

  if is_admin then
    return new;
  end if;

  -- parent may only go null -> value, once
  if old.post_id is not null and new.post_id is distinct from old.post_id then
    raise exception 'CA_PARENT_LOCKED';
  end if;
  if old.comment_id is not null and new.comment_id is distinct from old.comment_id then
    raise exception 'CA_PARENT_LOCKED';
  end if;

  if new.post_id is not null and old.post_id is null then
    select author_id into parent_author
      from public.community_posts where id = new.post_id;
    if parent_author is null or parent_author <> auth.uid() then
      raise exception 'CA_PARENT_FORBIDDEN';
    end if;
  end if;

  if new.comment_id is not null and old.comment_id is null then
    select author_id into parent_author
      from public.community_comments where id = new.comment_id;
    if parent_author is null or parent_author <> auth.uid() then
      raise exception 'CA_PARENT_FORBIDDEN';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_ca_guard on public.community_attachments;
create trigger trg_ca_guard
  before update on public.community_attachments
  for each row execute procedure public.ca_guard_update();

-- ── 5. Rate limit — 30 uploads / hour / member ──────────────────────────────
create or replace function public.ca_rate_limit() returns trigger as $$
declare n integer;
begin
  if coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com' then
    return new;
  end if;
  select count(*) into n
    from public.community_attachments
   where owner_id = new.owner_id
     and created_at > now() - interval '1 hour';
  if n >= 30 then
    raise exception 'CA_RATE_LIMIT';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_ca_rate on public.community_attachments;
create trigger trg_ca_rate
  before insert on public.community_attachments
  for each row execute procedure public.ca_rate_limit();

-- ── 6. RLS ──────────────────────────────────────────────────────────────────
alter table public.community_attachments enable row level security;

-- read: attachments belong to public posts; the objects are public anyway
drop policy if exists ca_select on public.community_attachments;
create policy ca_select on public.community_attachments for select using (true);

-- insert: own row, and ALWAYS as a draft. Claiming a parent is a separate,
--         guarded UPDATE — so a forged insert cannot target another's post.
drop policy if exists ca_insert on public.community_attachments;
create policy ca_insert on public.community_attachments for insert
  with check (
    auth.uid() = owner_id
    and post_id is null
    and comment_id is null
  );

drop policy if exists ca_update on public.community_attachments;
create policy ca_update on public.community_attachments for update
  using (
    auth.uid() = owner_id
    or coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com'
  );

drop policy if exists ca_delete on public.community_attachments;
create policy ca_delete on public.community_attachments for delete
  using (
    auth.uid() = owner_id
    or coalesce(auth.jwt()->>'email', '') = 'ksb3171@gmail.com'
  );

-- ── 7. Admin sweep — abandoned drafts (composed, never submitted) ────────────
--  Postgres cannot delete Storage objects, so this returns the paths and the
--  client removes them from Storage before deleting the rows.
create or replace function public.ca_list_orphans()
returns table (id uuid, bucket text, path text, created_at timestamptz) as $$
begin
  if coalesce(auth.jwt()->>'email', '') <> 'ksb3171@gmail.com' then
    raise exception 'CA_FORBIDDEN';
  end if;
  return query
    select a.id, a.bucket, a.path, a.created_at
      from public.community_attachments a
     where a.post_id is null
       and a.comment_id is null
       and a.created_at < now() - interval '24 hours'
     order by a.created_at;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function public.ca_list_orphans() from public;
grant execute on function public.ca_list_orphans() to authenticated;

-- ── 8. Admin sweep — every known object (to diff against a Storage listing) ──
--  Finds Storage objects whose row is already gone — e.g. a commenter's file on
--  a post deleted by the post author: the row cascades away, the object does not.
create or replace function public.ca_all_paths()
returns table (bucket text, path text) as $$
begin
  if coalesce(auth.jwt()->>'email', '') <> 'ksb3171@gmail.com' then
    raise exception 'CA_FORBIDDEN';
  end if;
  return query select a.bucket, a.path from public.community_attachments a;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function public.ca_all_paths() from public;
grant execute on function public.ca_all_paths() to authenticated;
