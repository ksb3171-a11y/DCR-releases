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
