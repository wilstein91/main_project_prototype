-- ═══════════════════════════════════════════════════════════════
-- 0001_init — 스키마 · 트리거 · RLS
-- 대응: TECH_SPEC §4.2 / §4.3 / §4.4
--
-- 적용 방법: Supabase 프로젝트 생성 후 SQL Editor 에 붙여넣거나
--            supabase CLI 로 `supabase db push`
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- profiles : auth.users 확장
-- ─────────────────────────────────────────────
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  nickname            text not null unique
                      check (char_length(nickname) between 2 and 12),
  role                text not null default 'user'
                      check (role in ('user','admin')),
  status              text not null default 'active'
                      check (status in ('active','withdrawn')),
  nickname_changed_at timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- categories : 코드 수정 없이 추가/정렬 가능
-- ─────────────────────────────────────────────
create table public.categories (
  id          smallint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  description text,
  sort_order  smallint not null default 0,
  write_role  text not null default 'user'
              check (write_role in ('user','admin')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.categories (slug, name, description, sort_order, write_role) values
  ('notice', '공지사항',   '서비스 운영에 관한 공지입니다.',            1, 'admin'),
  ('free',   '자유게시판', '주제 제한 없이 자유롭게 이야기하는 곳입니다.', 2, 'user'),
  ('stock',  '종목토론',   '개별 종목에 대한 의견을 나눕니다.',          3, 'user'),
  ('market', '시황·뉴스',  '시장 흐름과 뉴스를 공유합니다.',             4, 'user'),
  ('qna',    '질문답변',   '모르는 것을 묻고 답하는 곳입니다.',          5, 'user');

-- ─────────────────────────────────────────────
-- posts
-- ─────────────────────────────────────────────
create table public.posts (
  id            bigint generated always as identity primary key,
  category_id   smallint not null references public.categories(id),
  author_id     uuid references public.profiles(id) on delete set null,
  title         text not null check (char_length(title) between 1 and 100),
  content       text not null check (char_length(content) between 1 and 20000),
  view_count    integer not null default 0,
  comment_count integer not null default 0,
  is_pinned     boolean not null default false,
  is_deleted    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  edited_at     timestamptz
);

create index posts_category_created_idx
  on public.posts (category_id, is_pinned desc, created_at desc)
  where is_deleted = false;

create index posts_created_idx
  on public.posts (created_at desc)
  where is_deleted = false;

create index posts_author_idx on public.posts (author_id);

-- ─────────────────────────────────────────────
-- comments : 대댓글 1단계까지
-- ─────────────────────────────────────────────
create table public.comments (
  id         bigint generated always as identity primary key,
  post_id    bigint not null references public.posts(id) on delete cascade,
  author_id  uuid references public.profiles(id) on delete set null,
  parent_id  bigint references public.comments(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 1000),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_post_idx on public.comments (post_id, created_at);

-- ─────────────────────────────────────────────
-- audit_logs : 관리자 행위 기록 (PRD D-4)
-- ─────────────────────────────────────────────
create table public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.profiles(id),
  action      text not null,
  target_type text not null,
  target_id   text not null,
  reason      text,
  created_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- 함수 · 트리거
-- ═══════════════════════════════════════════════════════════════

-- 관리자 판정 (profiles RLS 재귀 방지를 위해 SECURITY DEFINER)
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and role = 'admin'
  );
$$;

-- 닉네임 사전 확인 (UX용. 최종 보증은 UNIQUE 제약)
create or replace function public.is_nickname_available(p_nickname text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select not exists (
    select 1 from public.profiles where nickname = p_nickname
  );
$$;

-- 가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, new.raw_user_meta_data->>'nickname');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 댓글 수 동기화
create or replace function public.sync_comment_count()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.posts p
     set comment_count = (
       select count(*) from public.comments c
        where c.post_id = p.id and c.is_deleted = false
     )
   where p.id = coalesce(new.post_id, old.post_id);
  return null;
end;
$$;

create trigger comments_count_sync
  after insert or update of is_deleted or delete on public.comments
  for each row execute function public.sync_comment_count();

-- 대댓글 깊이 1단계 제한
create or replace function public.enforce_comment_depth()
returns trigger
language plpgsql
as $$
begin
  if new.parent_id is not null then
    if exists (
      select 1 from public.comments
       where id = new.parent_id and parent_id is not null
    ) then
      raise exception '대댓글은 1단계까지만 작성할 수 있습니다';
    end if;
  end if;
  return new;
end;
$$;

create trigger comments_depth_check
  before insert on public.comments
  for each row execute function public.enforce_comment_depth();

-- 조회수 증가 (RLS update 정책을 우회해야 하므로 DEFINER, 단일 컬럼만)
create or replace function public.increment_view_count(p_post_id bigint)
returns void
language sql security definer set search_path = public
as $$
  update public.posts set view_count = view_count + 1
   where id = p_post_id and is_deleted = false;
$$;

revoke execute on function public.increment_view_count(bigint) from public;
grant  execute on function public.increment_view_count(bigint) to anon, authenticated;
revoke execute on function public.is_nickname_available(text) from public;
grant  execute on function public.is_nickname_available(text) to anon, authenticated;

-- ═══════════════════════════════════════════════════════════════
-- RLS — 모든 테이블에 활성화한다. 예외 없음.
-- 삭제는 is_deleted = true UPDATE 로 처리하므로 DELETE 정책은 만들지 않는다.
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.posts      enable row level security;
alter table public.comments   enable row level security;
alter table public.audit_logs enable row level security;

-- profiles : 닉네임 표시를 위해 읽기는 공개, 수정은 본인만
create policy profiles_select on public.profiles
  for select using (true);

create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- categories : 읽기 공개, 쓰기는 관리자
create policy categories_select on public.categories
  for select using (is_active = true or public.is_admin());

create policy categories_write on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- posts
create policy posts_select on public.posts
  for select using (is_deleted = false or public.is_admin());

create policy posts_insert on public.posts
  for insert to authenticated with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.categories c
       where c.id = category_id
         and c.is_active
         and (c.write_role = 'user' or public.is_admin())
    )
  );

create policy posts_update_own on public.posts
  for update to authenticated
  using (auth.uid() = author_id and is_deleted = false)
  with check (auth.uid() = author_id);

create policy posts_admin_all on public.posts
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- comments
create policy comments_select on public.comments
  for select using (true);

create policy comments_insert on public.comments
  for insert to authenticated with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.posts p
       where p.id = post_id and p.is_deleted = false
    )
  );

create policy comments_update_own on public.comments
  for update to authenticated
  using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy comments_admin_all on public.comments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- audit_logs : 관리자만 조회·기록
create policy audit_select_admin on public.audit_logs
  for select to authenticated using (public.is_admin());

create policy audit_insert_admin on public.audit_logs
  for insert to authenticated with check (public.is_admin());
