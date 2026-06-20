-- ================================================================
-- DCR Supabase 초기 설정
-- Supabase 대시보드 → SQL Editor → 아래 전체 복사 후 실행
-- ================================================================

-- 1. profiles 테이블 생성
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  email         text        not null,
  name          text        not null,
  affiliation   text        not null,
  phone         text        not null,
  created_at    timestamptz default now(),
  expires_at    timestamptz default (now() + interval '30 days'),
  is_blocked    boolean     default false,
  plan          text        default 'beta'
);

-- 2. RLS 활성화
alter table public.profiles enable row level security;

-- 3. 본인 프로필만 조회 가능
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- 4. 본인 프로필만 수정 가능
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 5. 회원가입 시 profiles 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, affiliation, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'affiliation', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ================================================================
-- 기능개선 요청 게시판 (Feature Request Board)
-- Supabase 대시보드 → SQL Editor → 아래 전체 복사 후 실행 (최초 1회)
-- 정책: 읽기=누구나 / 작성·투표=로그인 회원 / 상태·답변·삭제=관리자
-- ================================================================

-- 1. 요청 테이블
create table if not exists public.feature_requests (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(title) between 2 and 140),
  body           text not null check (char_length(body) between 1 and 4000),
  category       text not null default 'etc'
                   check (category in ('analysis','design','ui','bug','etc')),
  author_id      uuid not null references auth.users(id) on delete cascade,
  author_name    text not null default 'Member',
  status         text not null default 'proposed'
                   check (status in ('proposed','reviewing','planned','in_progress','done','declined')),
  admin_reply    text,
  admin_reply_at timestamptz,
  vote_count     integer not null default 0,
  is_hidden      boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists idx_fr_created on public.feature_requests(created_at desc);
create index if not exists idx_fr_votes   on public.feature_requests(vote_count desc);

-- 2. 투표 테이블 (회원 1인 1표, 서버 중복방지)
create table if not exists public.feature_votes (
  request_id uuid not null references public.feature_requests(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id, user_id)
);

-- 3. 투표수 자동 집계 트리거
create or replace function public.fr_bump_votes() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.feature_requests set vote_count = vote_count + 1 where id = new.request_id;
  elsif (tg_op = 'DELETE') then
    update public.feature_requests set vote_count = greatest(vote_count - 1, 0) where id = old.request_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_fr_votes on public.feature_votes;
create trigger trg_fr_votes
  after insert or delete on public.feature_votes
  for each row execute procedure public.fr_bump_votes();

-- 4. RLS 활성화
alter table public.feature_requests enable row level security;
alter table public.feature_votes    enable row level security;

-- 5. 요청 정책
--   읽기: 누구나 (숨김 글은 관리자만)
drop policy if exists fr_select on public.feature_requests;
create policy fr_select on public.feature_requests for select
  using (is_hidden = false or auth.jwt()->>'email' = 'ksb3171@gmail.com');

--   작성: 로그인 회원만, 본인 글, 초기 상태 고정 (상태/답변/숨김/투표수 조작 차단)
drop policy if exists fr_insert on public.feature_requests;
create policy fr_insert on public.feature_requests for insert
  with check (
    auth.uid() = author_id
    and status = 'proposed'
    and admin_reply is null
    and is_hidden = false
    and vote_count = 0
  );

--   수정(상태·답변·숨김): 관리자만
drop policy if exists fr_update on public.feature_requests;
create policy fr_update on public.feature_requests for update
  using (auth.jwt()->>'email' = 'ksb3171@gmail.com');

--   삭제: 관리자만
drop policy if exists fr_delete on public.feature_requests;
create policy fr_delete on public.feature_requests for delete
  using (auth.jwt()->>'email' = 'ksb3171@gmail.com');

-- 6. 투표 정책
--   읽기: 누구나 (집계용) / 추가·취소: 본인 표만
drop policy if exists fv_select on public.feature_votes;
create policy fv_select on public.feature_votes for select using (true);
drop policy if exists fv_insert on public.feature_votes;
create policy fv_insert on public.feature_votes for insert with check (auth.uid() = user_id);
drop policy if exists fv_delete on public.feature_votes;
create policy fv_delete on public.feature_votes for delete using (auth.uid() = user_id);
