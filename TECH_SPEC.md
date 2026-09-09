# 기술명세서 — 영웅호걸닷컴 (가칭)

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.3 |
| 작성일 | 2026-09-08 |
| 대응 PRD | [PRD.md](PRD.md) |
| 서비스명 | **영웅호걸닷컴** (가칭 · PRD §1.1 확인 사항 미완) |
| 트랙 구조 | **커뮤니티 전용.** 자문사 트랙은 별도 웹사이트로 분리됨 — PRD §3.4 |
| 대상 릴리스 | MVP (Phase 1) |

---

## 1. 기술 스택

| 계층 | 선택 | 버전 (실제 설치) |
|---|---|---|
| 프레임워크 | Next.js (App Router, Turbopack) | **16.3.4** |
| 언어 | TypeScript | 5.x |
| UI | React | 19.2.8 |
| 스타일 | Tailwind CSS | 4.x |
| 폰트 | Pretendard (self-host) | - |
| 인증 | Supabase Auth (이메일+비밀번호) | - |
| DB | Supabase PostgreSQL | 15+ |
| 서버 연동 | `@supabase/ssr` | 최신 |
| 폼·검증 | react-hook-form + zod | 최신 |
| 마크다운 | react-markdown + remark-gfm + rehype-sanitize | 최신 |
| 배포 | Vercel | - |
| 오류 추적 | Sentry (Phase 1 말 도입) | - |

### 1.0 Next.js 16 반영 사항 (v0.3 추가)

스캐폴딩 결과 Next.js 16이 설치되어 아래 세 가지가 15 기준 설계와 다르다. 문서 전반에 반영했다.

| 항목 | 15 | **16** |
|---|---|---|
| 미들웨어 | `middleware.ts` / `export function middleware` | **`proxy.ts` / `export function proxy`** (런타임은 `nodejs` 고정, `edge` 불가) |
| `params` · `searchParams` · `cookies()` | 동기 접근 호환 | **완전 비동기 — 반드시 `await`** |
| 번들러 | 옵트인 | Turbopack 기본 (dev·build 모두) |

라우트 props 타입은 `next typegen` 이 생성하는 전역 헬퍼(`PageProps<'/c/[slug]'>`, `LayoutProps<'/'>`)를 쓴다. 타입 오류가 나면 `npx next typegen` 을 먼저 실행한다.

> `node_modules/next/dist/docs/` 에 설치 버전과 일치하는 문서가 동봉되어 있다. API 를 기억에 의존해 쓰지 말고 이 문서를 확인한다 (`AGENTS.md` 가 이를 지시한다).

### 1.1 선정 근거

- **Next.js SSR** — 비회원에게 본문까지 공개하는 정책이므로 검색 노출이 곧 성장 동력이다. 글 상세는 반드시 서버 렌더링되어야 한다.
- **Supabase** — 인증·DB·스토리지를 한 서비스로 묶어 MVP 개발 기간을 단축한다. 행 수준 보안(RLS)으로 접근 제어를 DB 계층에 강제할 수 있어, 애플리케이션 코드의 실수가 곧바로 데이터 유출로 이어지지 않는다.
- **단일 코드베이스 반응형** — 모바일 전용 코드베이스를 만들지 않는다. 유지보수 비용이 두 배가 되고 기능 격차가 벌어진다.

### 1.2 검토했으나 채택하지 않은 것

| 후보 | 제외 사유 |
|---|---|
| Django + Postgres | 관리자 페이지 기본 제공은 매력적이나, 목표하는 프론트엔드 완성도를 내려면 결국 React를 붙여야 하고 그 순간 언어가 이원화된다 |
| Next.js + Prisma + 자체 DB | 인증을 직접 구현해야 해 MVP 일정이 2~3주 늘어난다. Phase 4에서 락인이 문제가 되면 그때 이관을 검토한다 |
| FastAPI + React 분리 | 인증·CORS·배포를 전부 직접 조립. 1인 MVP에 부적합 |
| 리치 텍스트 에디터 (TipTap 등) | "가벼운 사이트" 목표에 반한다. 마크다운 + 미리보기로 시작 |

---

## 2. 시스템 아키텍처

```
[브라우저]
    │  HTTPS
    ▼
[Vercel — proxy.ts (nodejs)]
    │  세션 쿠키 갱신 / 보호 경로 판정
    ▼
[Next.js App Router]
    ├─ Server Component ── 조회 쿼리 (사용자 세션 기반 Supabase 클라이언트)
    ├─ Server Action ───── 생성/수정/삭제 (사용자 세션 기반)
    └─ Route Handler ───── 인증 콜백 등
    │
    ▼ (PostgREST, 사용자 JWT 포함)
[Supabase]
    ├─ Auth         — 회원, 세션, 메일 발송
    ├─ PostgreSQL   — RLS로 모든 접근 제어
    └─ SMTP(Resend) — 인증·재설정 메일
```

### 2.1 핵심 원칙

1. **service_role 키는 애플리케이션 런타임에서 사용하지 않는다.** 모든 데이터 접근은 사용자 JWT를 통과시켜 RLS의 판정을 받는다. 서버 전용 키가 필요한 배치 작업이 생기면 별도 검토 후 도입한다.
2. **권한 검사는 DB에 둔다.** UI의 버튼 숨김은 편의일 뿐 보안이 아니다.
3. **데이터 변경은 Server Action으로만.** 클라이언트에서 직접 write 호출하지 않는다.

---

## 3. 디렉터리 구조

```
Main_Project/
├─ src/
│  ├─ app/
│  │  ├─ (main)/                            # 커뮤니티 셸 (헤더·사이드바·하단탭·푸터)
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx                        # 홈 — 통합 피드          [커뮤니티]
│  │  │  ├─ c/[slug]/page.tsx               # 카테고리 목록           [커뮤니티]
│  │  │  ├─ c/[slug]/[id]/page.tsx          # 글 상세                 [커뮤니티]
│  │  │  ├─ c/[slug]/[id]/edit/page.tsx     # 글 수정 (작성자만)      [커뮤니티]
│  │  │  ├─ write/page.tsx                  # 글쓰기                  [커뮤니티]
│  │  │  ├─ settings/page.tsx               # 프로필 설정             [커뮤니티]
│  │  │  ├─ admin/page.tsx                  # 관리자 (role 재확인)    [커뮤니티]
│  │  │  ├─ about/page.tsx                  # 서비스 소개             [커뮤니티 · live]
│  │  │  ├─ terms/page.tsx                  #                         [커뮤니티 · live]
│  │  │  ├─ privacy/page.tsx                #                         [커뮤니티 · live]
│  │  │  ├─ disclaimer/page.tsx             #                         [커뮤니티 · live]
│  │  │  ├─ company/page.tsx                # 자문사 소개  [자문사 · under_construction]
│  │  │  └─ advisory/page.tsx               # 자문 안내    [자문사 · hidden → 404]
│  │  ├─ (auth)/                            # 인증 셸 (사이드바·하단탭 없음)
│  │  │  ├─ layout.tsx
│  │  │  ├─ login/page.tsx
│  │  │  ├─ signup/page.tsx
│  │  │  └─ reset-password/page.tsx
│  │  ├─ auth/callback/route.ts              # 인증 콜백 (code → session)
│  │  ├─ layout.tsx                          # html/body · 메타데이터
│  │  ├─ not-found.tsx · error.tsx
│  │  ├─ globals.css                         # 디자인 토큰(@theme) + 마크다운 스타일
│  │  ├─ sitemap.ts · robots.ts
│  ├─ config/                                # ★ 규제·사업자 상태 단일 관리 지점
│  │  ├─ company.ts                          #   사업자 정보 (미확정 = null)
│  │  ├─ features.ts                         #   커뮤니티 기능 레지스트리
│  │  └─ legal.ts                            #   법적 고지문 (PRD 부록 A)
│  ├─ components/
│  │  ├─ layout/                             # Header, CategoryNav, BottomTab, Footer
│  │  ├─ auth/                               # SignUpForm, SignInForm, ResetRequestForm
│  │  ├─ post/                               # PostList, PostForm, PostBody(sanitize)
│  │  ├─ comment/                            # CommentList, CommentItem, CommentForm
│  │  ├─ settings/SettingsForms.tsx          # 닉네임·비밀번호·탈퇴
│  │  └─ ui/                                 # Button, Field, Badge, Empty, LegalDoc,
│  │                                         # SubmitButton, FormFeedback, DeleteForm,
│  │                                         # PendingNotice(시드 모드 안내)
│  ├─ lib/
│  │  ├─ data/                               # 데이터 접근 계층
│  │  │  ├─ types.ts                         #   QueryProvider 계약 + POSTS_PER_PAGE
│  │  │  ├─ queries.ts                       #   진입점 — 키 유무로 아래 둘 중 선택
│  │  │  ├─ queries.supabase.ts              #   실 DB 구현
│  │  │  ├─ queries.seed.ts                  #   시드 구현 (연결 후 삭제)
│  │  │  └─ seed.ts                          #   시드 데이터 (연결 후 삭제)
│  │  ├─ supabase/
│  │  │  ├─ config.ts                        #   isSupabaseConfigured() — 모드 판정
│  │  │  ├─ client.ts                        #   브라우저 클라이언트
│  │  │  ├─ server.ts                        #   서버 컴포넌트/액션 + 세션 프로필
│  │  │  └─ proxy.ts                         #   세션 갱신 + 보호 경로 판정
│  │  ├─ actions/                            # Server Actions — 데이터 변경 전용
│  │  │  ├─ result.ts                        #   ActionState, zod·Supabase 오류 변환
│  │  │  ├─ auth.ts                          #   가입·로그인·로그아웃·비밀번호
│  │  │  ├─ post.ts                          #   작성·수정·삭제(소프트)·조회수
│  │  │  ├─ comment.ts                       #   작성·수정·삭제(소프트)
│  │  │  └─ profile.ts                       #   닉네임 변경·탈퇴
│  │  ├─ validations/schemas.ts               # zod 스키마 (zod 4 API)
│  │  ├─ profile-rules.ts                    # 순수 함수 — "use server" 밖에 둔다
│  │  ├─ session.ts                          # getViewer() — 화면용 세션 조회
│  │  ├─ utils/date.ts                       # KST 날짜 포맷
│  │  └─ site.ts                             # 배포 주소
│  ├─ types/
│  │  ├─ database.ts                         # Supabase Database 타입 (gen types 로 교체)
│  │  └─ db.ts                               # 화면용 조회 모델
│  └─ proxy.ts                               # Next 16 규약 (middleware.ts 아님)
├─ supabase/migrations/0001_init.sql          # 스키마 · 트리거 · RLS (§4)
├─ .claude/launch.json                        # 개발 서버 (포트 3200)
├─ AGENTS.md · CLAUDE.md                      # Next 16 문서 참조 지시 (자동 생성)
├─ README.md · PRD.md · TECH_SPEC.md
├─ SUPABASE_SETUP.md                          # DB 연결 절차
├─ .env.local.example                         # 커밋 대상 (.gitignore 예외)
└─ .env.local                                 # git 제외
```

---

## 4. 데이터 모델

### 4.1 ERD

```
auth.users (Supabase 관리)
    │ 1:1
    ▼
profiles ──1:N──> posts ──1:N──> comments
    │                              │
    └──────────1:N─────────────────┘

categories ──1:N──> posts
profiles   ──1:N──> audit_logs
```

### 4.2 스키마

```sql
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

insert into public.categories (slug, name, sort_order, write_role) values
  ('notice', '공지사항',   1, 'admin'),
  ('free',   '자유게시판', 2, 'user'),
  ('stock',  '종목토론',   3, 'user'),
  ('market', '시황·뉴스',  4, 'user'),
  ('qna',    '질문답변',   5, 'user');

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
-- audit_logs : 관리자 행위 기록
-- ─────────────────────────────────────────────
create table public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.profiles(id),
  action      text not null,          -- 'delete_post' | 'delete_comment' | ...
  target_type text not null,          -- 'post' | 'comment' | 'profile'
  target_id   text not null,
  reason      text,
  created_at  timestamptz not null default now()
);
```

### 4.3 트리거 · 함수

```sql
-- 관리자 판정 (profiles RLS 재귀 방지를 위해 SECURITY DEFINER)
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as 'select exists (select 1 from public.profiles
                    where id = auth.uid() and role = ''admin'')';

-- 가입 시 프로필 자동 생성 (닉네임은 회원가입 메타데이터에서)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $fn$
begin
  insert into public.profiles (id, nickname)
  values (new.id, new.raw_user_meta_data->>'nickname');
  return new;
end;
$fn$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 댓글 수 동기화
create or replace function public.sync_comment_count()
returns trigger
language plpgsql security definer set search_path = public
as $fn$
begin
  update public.posts p
     set comment_count = (
       select count(*) from public.comments c
        where c.post_id = p.id and c.is_deleted = false
     )
   where p.id = coalesce(new.post_id, old.post_id);
  return null;
end;
$fn$;

create trigger comments_count_sync
  after insert or update of is_deleted or delete on public.comments
  for each row execute function public.sync_comment_count();

-- 대댓글 깊이 1단계 제한
create or replace function public.enforce_comment_depth()
returns trigger
language plpgsql
as $fn$
begin
  if new.parent_id is not null then
    if exists (select 1 from public.comments
                where id = new.parent_id and parent_id is not null) then
      raise exception '대댓글은 1단계까지만 작성할 수 있습니다';
    end if;
  end if;
  return new;
end;
$fn$;

create trigger comments_depth_check
  before insert on public.comments
  for each row execute function public.enforce_comment_depth();

-- 조회수 증가 (RLS의 update 정책을 우회해야 하므로 DEFINER, 단일 컬럼만 갱신)
create or replace function public.increment_view_count(p_post_id bigint)
returns void
language sql security definer set search_path = public
as 'update public.posts set view_count = view_count + 1
     where id = p_post_id and is_deleted = false';

revoke execute on function public.increment_view_count(bigint) from public;
grant  execute on function public.increment_view_count(bigint) to anon, authenticated;
```

### 4.4 RLS 정책

**모든 테이블에 RLS를 활성화한다. 예외 없음.**

```sql
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

-- comments (동일 패턴)
create policy comments_select on public.comments
  for select using (true);

create policy comments_insert on public.comments
  for insert to authenticated with check (
    auth.uid() = author_id
    and exists (select 1 from public.posts p
                 where p.id = post_id and p.is_deleted = false)
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
```

> **삭제는 물리 삭제 대신 `is_deleted = true` UPDATE로 처리한다.** DELETE 정책은 만들지 않는다.

---

## 5. 인증 설계

### 5.1 회원가입 흐름

```
1. /signup 폼 입력 (이메일 · 비밀번호 · 닉네임 · 약관 동의)
2. 클라이언트 zod 검증
3. Server Action → RPC is_nickname_available(nickname) 사전 확인
4. supabase.auth.signUp({ email, password, options: { data: { nickname } } })
5. handle_new_user 트리거가 profiles 행 생성
   └ 닉네임 UNIQUE 충돌 시 signUp 자체가 실패 → 사용자에게 재입력 안내
6. 인증 메일 발송 → 사용자가 링크 클릭
7. /auth/callback 에서 세션 확정 → 홈으로 이동
```

> 3번은 UX용 사전 확인이며, **최종 보증은 DB의 UNIQUE 제약**이다. 경쟁 상태에서 3번을 통과하더라도 5번에서 막힌다.

### 5.2 세션 관리

- `@supabase/ssr` 기반 쿠키 세션. **`src/proxy.ts`** 에서 매 요청 세션을 갱신한다 (Next 16 에서 `middleware` 규약이 `proxy` 로 변경됨).
- proxy 보호 경로: `/write`, `/settings`, `/c/*/*/edit`, `/admin`
- 미인증 접근 시 `/login?redirect=<원래경로>`로 이동, 로그인 후 원래 위치로 복귀.
- `/admin`은 proxy 통과 후 서버 컴포넌트에서 `role = 'admin'`을 재확인한다 (proxy 만 믿지 않는다).

### 5.3 비밀번호 정책

| 항목 | 값 |
|---|---|
| 최소 길이 | 10자 |
| 복잡도 | 영문·숫자·특수문자 중 2종 이상 |
| 유출 비밀번호 차단 | Supabase Auth의 HaveIBeenPwned 연동 활성화 |
| 저장 | 직접 저장하지 않음 (Supabase Auth 위임) |

---

## 6. Server Actions 명세

| 액션 | 입력 | 권한 | 반환 |
|---|---|---|---|
| `signUp` | email, password, nickname, agreements | 비회원 | 성공 / 필드별 오류 |
| `signIn` | email, password | 비회원 | 세션 |
| `signOut` | - | 회원 | redirect `/` |
| `requestPasswordReset` | email | 비회원 | 항상 성공 응답 (계정 존재 여부 노출 금지) |
| `updateProfile` | nickname | 본인 | 갱신된 프로필 |
| `createPost` | categoryId, title, content | 회원 (공지는 관리자) | postId |
| `updatePost` | postId, title, content | 작성자 | - |
| `deletePost` | postId, reason? | 작성자 / 관리자 | - |
| `createComment` | postId, parentId?, content | 회원 | commentId |
| `updateComment` | commentId, content | 작성자 | - |
| `deleteComment` | commentId | 작성자 / 관리자 | - |

**공통 규칙**

- 모든 입력은 서버에서 zod로 재검증한다. 클라이언트 검증은 UX용이다.
- 변경 후 `revalidatePath()`로 목록·상세 캐시를 무효화한다.
- 관리자가 타인 게시물을 삭제하면 같은 트랜잭션에서 `audit_logs`에 기록한다.
- 오류는 예외를 던지지 않고 `{ ok: false, fieldErrors }` 형태로 반환해 폼에 표시한다.

---

## 7. 주요 쿼리

### 7.1 카테고리 글 목록 (20건, 오프셋 페이지네이션)

```sql
select p.id, p.title, p.created_at, p.view_count, p.comment_count, p.is_pinned,
       pr.nickname as author_nickname
  from posts p
  left join profiles pr on pr.id = p.author_id
 where p.category_id = $1 and p.is_deleted = false
 order by p.is_pinned desc, p.created_at desc
 limit 20 offset $2;
```

`posts_category_created_idx`가 그대로 사용된다. Phase 2에서 목록이 커지면 커서 페이지네이션(`created_at, id` 복합 커서)으로 전환한다.

### 7.2 글 상세 + 댓글

두 번의 쿼리로 분리한다 (조인하면 본문이 댓글 수만큼 중복 전송된다).

1. 글 1건 + 작성자 닉네임
2. 해당 글의 댓글 전체 + 작성자 닉네임 → 클라이언트에서 `parent_id` 기준 2단 트리 구성

---

## 8. UI 설계

### 8.1 디자인 토큰

Tailwind 4 의 `@theme` 로 선언한다 (`src/app/globals.css`). 토큰 이름이 곧 유틸리티 이름이 되므로
`bg-canvas` `text-ink` `border-line` 처럼 읽히게 지었다.

```css
@theme {
  /* 색 */
  --color-canvas: #ffffff;   /* bg-canvas */
  --color-surface: #f9fafb;  /* bg-surface */
  --color-line: #e5e8eb;     /* border-line */
  --color-ink: #191f28;      /* text-ink */
  --color-ink-sub: #8b95a1;  /* text-ink-sub */
  --color-brand: #3182f6;    /* text-brand / bg-brand */
  --color-brand-soft: #ebf3fe;
  --color-danger: #f04452;

  /* 타이포 — 본문은 15px 아래로 내리지 않는다 */
  --text-title: 20px;   /* 글 제목 */
  --text-body: 16px;    /* 본문, line-height 1.7 */
  --text-list: 15px;    /* 목록 제목 */
  --text-meta: 13px;    /* 작성자·시각 */

  /* 형태 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --font-sans: "Pretendard Variable", Pretendard, -apple-system, …;
}
```

커스텀 유틸리티 2개도 함께 둔다.

| 유틸 | 용도 |
|---|---|
| `tap` | 터치 타겟 최소 44×44px 확보 |
| `prose-post` | 사용자 본문 렌더링 (마크다운 도입 전 `white-space: pre-wrap`) |

**원칙**

- 테두리보다 **여백과 배경색**으로 영역을 구분한다. 선이 많으면 무거워 보인다.
- 그림자는 실제로 떠 있어야 하는 요소(하단 탭, 헤더)에만 쓴다.
- 포인트 색은 링크·주요 버튼·활성 카테고리에만. 남용하면 강조가 사라진다.
- **MVP 는 라이트 테마로 확정한다.** 다크 테마는 Phase 5 에서 검토한다.

**폰트 미해결** — Pretendard woff2 를 `public/` 에 넣고 `@font-face` 를 선언하는 작업이 남아 있다
(T-03 잔여). 현재는 시스템 한글 폰트로 폴백된다.

### 8.2 반응형

| 브레이크포인트 | 레이아웃 |
|---|---|
| `< 768px` | 상단 앱바(로고+로그인) / 가로 스크롤 카테고리 칩 / 본문 / 하단 탭 4개 |
| `768~1023px` | 상단 헤더 + 카테고리 가로 탭. 사이드바 없음 |
| `≥ 1024px` | 좌측 카테고리 사이드바(고정 200px) + 본문(최대 1000px), 전체 최대 1200px 중앙 정렬 |

모바일 하단 탭: **홈 / 게시판 / 글쓰기 / 내정보** — 4개를 넘기지 않는다.
글쓰기 탭은 비회원이 눌러도 숨기지 않고 로그인 화면으로 보낸다 (가입 유도 지점).

### 8.3 접근성

- 본문 대비율 4.5:1 이상 (`#191F28` on `#FFFFFF` = 15.8:1)
- 모든 터치 타겟 최소 44×44px
- 폼 입력에 `<label>` 연결, 오류는 색만이 아니라 텍스트로도 표시
- 이미지 `alt`, 페이지별 고유 `<title>`

---

## 9. 구현 세부

### 9.1 마크다운 렌더링과 XSS

사용자 입력 본문은 **반드시** `rehype-sanitize`를 통과시킨다.

- 허용: 제목, 굵게, 기울임, 링크, 목록, 인용, 코드블록, 표, 구분선
- 차단: `<script>`, `<iframe>`, `on*` 이벤트 속성, `style` 속성, `javascript:` 스킴
- 외부 링크는 `rel="nofollow noopener noreferrer" target="_blank"` 강제
- `dangerouslySetInnerHTML`은 사용하지 않는다

### 9.2 조회수 중복 방지 (MVP 수준)

상세 진입 시 `sessionStorage`에 조회한 글 ID를 기록해 같은 세션 내 재증가를 막는다.
서버 측 강제는 아니므로 정확한 통계가 아니다 — **알려진 한계로 문서화하고**, Phase 2에서 `post_views(post_id, viewer_key, viewed_at)` 테이블 기반으로 교체한다.

### 9.3 삭제 처리

| 대상 | 처리 |
|---|---|
| 글 | `is_deleted = true`. 목록·상세에서 제외. 관리자에게만 조회 가능 |
| 댓글 | `is_deleted = true`. 자리는 남기고 `삭제된 댓글입니다` 표기 (대댓글 트리 붕괴 방지) |
| 탈퇴 회원 | `profiles.status = 'withdrawn'`, 닉네임을 `탈퇴한 사용자`로 대체. 작성물은 유지 |

### 9.4 오류 · 빈 상태

- `error.tsx`, `not-found.tsx`를 라우트 그룹마다 배치
- 빈 목록은 공백이 아니라 안내 문구 + 행동 유도 버튼(첫 글 작성하기)
- 로딩은 스피너 대신 스켈레톤 (레이아웃 흔들림 방지)

---

### 9.5 사업자 정보 중앙화 (`src/config/company.ts`)

법인 설립 전이므로 회사 정보를 **어디에도 하드코딩하지 않는다.** 이 파일 하나가 유일한 출처이며, 설립 완료 시 이 파일만 교체하면 전 페이지가 따라온다.

```ts
// src/config/company.ts
// ─────────────────────────────────────────────────────────────
// 설립·신고 완료 시 이 파일만 수정한다. 다른 파일은 손대지 않는다.
// 미확정 값은 반드시 null 로 둔다. 형식만 맞춘 더미 값을 넣지 않는다.
// ─────────────────────────────────────────────────────────────

export type IncorporationStatus = 'pre_incorporation' | 'incorporated'
export type AdvisoryStatus = 'none' | 'quasi_advisory' | 'investment_advisory'

export const COMPANY = {
  /** 법인 설립 상태 — 커뮤니티 트랙은 이 값에 영향받지 않는다 */
  incorporation: 'pre_incorporation' as IncorporationStatus,
  /** 자문업 신고·등록 상태 — 푸터의 등록번호 표기에만 쓴다 */
  advisory: 'none' as AdvisoryStatus,

  /** 서비스 가칭 — 인허가 연상 표현을 넣지 않는다 (PRD C-8) */
  serviceName: '영웅호걸닷컴',
  /** true 이면 화면 표기에 '(가칭)' 접두를 붙인다 */
  isTentativeName: true,

  /** 운영 주체 표기 (PRD §3.6) */
  operator: '개인 운영',

  /** 이하 미확정 항목 — 설립 후 실제 값으로 채운다 */
  legalName: null as string | null,      // 상호
  ceo: null as string | null,            // 대표자
  bizRegNo: null as string | null,       // 사업자등록번호
  address: null as string | null,        // 소재지
  advisoryRegNo: null as string | null,  // 자문업 등록·신고번호

  /** 문의 대응용 — 유일하게 실제 값이 들어가는 항목 */
  contactEmail: 'contact@example.com',
} as const

/** 미확정 값의 화면 표기 규칙 (PRD §3.5) */
export const PLACEHOLDER = {
  pending: '설립 절차 진행 중',
  notApplicable: '해당 없음 (미신고)',
} as const

export function displayServiceName(): string {
  return COMPANY.isTentativeName
    ? `(가칭) ${COMPANY.serviceName}`
    : COMPANY.serviceName
}

/** null 이면 임시 표기를 돌려준다 — 컴포넌트에서 분기하지 않게 한다 */
export function companyField(
  key: 'legalName' | 'ceo' | 'bizRegNo' | 'address',
): string {
  return COMPANY[key] ?? PLACEHOLDER.pending
}

export function advisoryRegDisplay(): string {
  return COMPANY.advisory === 'none'
    ? PLACEHOLDER.notApplicable
    : (COMPANY.advisoryRegNo ?? PLACEHOLDER.pending)
}
```

**규칙**

- 컴포넌트는 `COMPANY.legalName`을 직접 읽지 않고 `companyField('legalName')`을 쓴다. null 분기가 화면 곳곳에 흩어지지 않게 한다.
- 사업자 정보 문자열을 JSX에 직접 쓰는 것을 금지한다 (리뷰 시 확인 항목).
- 서비스명은 `layout.tsx` 메타데이터·헤더·OG 태그 모두 `displayServiceName()`을 경유한다.

### 9.6 기능 레지스트리 (`src/config/features.ts`)

> **v0.4 변경.** 이전에는 커뮤니티/자문사 두 트랙을 타입으로 갈라 3단계
> 게이트(`hidden` / `under_construction` / `live`)를 강제했다. 자문사 트랙이
> 별도 웹사이트로 나가면서(PRD §3.4 · O-9) **이 저장소에는 게이트가 없다.**
> 옮긴 게이트 코드는 [ADVISORY_TRACK_MOVED.md §3](ADVISORY_TRACK_MOVED.md) 에 있다.

남은 것은 **커뮤니티 기능의 목록과 개발 페이즈 기록**이다.

```ts
export type CommunityFeature =
  | 'board' | 'serviceAbout' | 'policyPages'
  | 'reactions' | 'search' | 'uploads' | 'notifications' | 'reports'   // Phase 2
  | 'activityTiers' | 'tags' | 'stockPages' | 'trendingStocks'         // Phase 3
  | 'newsBoard' | 'newsFeed' | 'disclosures' | 'watchlist'             // Phase 4
  | 'liveChat' | 'bannerAds'                                           // Phase 5

const COMMUNITY: Record<CommunityFeature, { phase: number }> = { /* ... */ }

export const isCommunityFeature = (k: string): k is CommunityFeature => k in COMMUNITY
export const featurePhase = (k: CommunityFeature): number => COMMUNITY[k].phase
```

**`phase` 필드의 의미** — 커뮤니티 기능은 "언제 만드느냐"만 다르고 "공개해도
되느냐"는 항상 참이다. `phase` 는 개발 순서를 기록할 뿐 런타임 판정에 쓰지
않는다. 아직 만들지 않은 기능은 코드가 없으므로 라우트도 없다.

**이 파일이 남아서 하는 일은 하나다** — PRD §3.3 금지 기능의 키가 생기지
못하게 막는 것. `features.test.ts` 의 `FORBIDDEN` 목록이 이를 검사한다.

| 금지 | 근거 |
|---|---|
| `returnRanking` · `profitVerification` · `accountSync` | I-4 수익률 표방 |
| `stockRecommendation` · `tradingSignal` · `stockScore` · `targetPrice` | I-3 운영 주체가 종목을 고르는 것 |
| `paidResearch` · `perkSubscription` · `paidSubscription` · `membership` | I-2 이용자에게 요금을 받는 것 |
| `companyIntro` · `advisoryIntro` · `researchBoard` | 자문사 트랙 — 별도 사이트 |

> `trendingStocks`(화제 종목)는 금지가 아니다. 운영 주체가 고르는 것이 아니라
> 공개 지표를 기계적으로 집계하는 것이며, 화면에 집계 기준과 매수·매도 권유가
> 아니라는 고지를 함께 표시한다 (PRD I-3 · §A-5-2). **그 고지가 빠지면 금지
> 기능이 된다.**

**커뮤니티 페이지에는 게이트 분기를 두지 않는다.**

```tsx
// app/(main)/c/[slug]/page.tsx — 규제 상태와 무관하게 항상 렌더링된다
export default async function CategoryPage() { /* 게이트 분기 없음 */ }
```

### 9.7 푸터 · sitemap · robots

#### 푸터

`Footer` 는 PRD 부록 A-2 축약 고지(서비스 성격 + 투자 유의)를 상시 노출하고,
그 아래에 `COMPANY.operator` 와 `companyField()` · `advisoryRegDisplay()` 로
운영 주체 정보를 렌더링한다.

서비스 성격 문단은 규제 상태와 무관하게 항상 같은 문구다. 설립·신고 후에는
사업자 정보 항목만 실제 값으로 바뀐다.

> **`자문업 등록·신고번호: 해당 없음 (미신고)` 를 지우지 말 것.** 자문사
> 트랙을 내보낸 뒤에도 남는다 — 자문사에 관한 정보가 아니라 **이 사이트가
> 자문사가 아니라는 고지**이기 때문이다 (PRD C-3 · §3.7).

#### 자문사 사이트 링크

푸터에 자문·일임사 웹사이트로 나가는 링크 자리가 있다. `COMPANY.advisorySiteUrl`
이 `null` 이면 아무것도 렌더하지 않는다.

> ⚠️ **자문업 신고·등록 완료 후에만 채운다.** 등록 전에 켜면 커뮤니티가
> 미등록 자문 서비스를 광고하는 모양이 되어, 규제와 무관해야 할 커뮤니티까지
> 규제 대상으로 끌고 들어간다 (PRD §3.4).

#### sitemap · robots

게이트가 없으므로 조건 분기도 없다. `app/sitemap.ts` 는 공개 라우트를 그대로
싣고, `app/robots.ts` 는 인증이 필요한 경로(`/admin` `/settings` `/write`
`/auth/`)만 제외한다. 색인 자체는 `ALLOW_INDEXING` 환경변수가 통제한다.

### 9.8 전환 절차 (설립·신고 완료 시)

| # | 작업 | 파일 |
|---|---|---|
| 1 | `incorporation`을 `incorporated`로, 사업자 정보 5개 항목을 실제 값으로 | `config/company.ts` |
| 2 | `operator`를 법인 표기로, `isTentativeName`을 `false`로 | `config/company.ts` |
| 3 | 자문업 신고·등록 완료 시 `advisory`와 `advisoryRegNo` 설정 | `config/company.ts` |
| 4 | **자문업 등록 완료 후** `advisorySiteUrl` 에 자문사 사이트 주소 입력 | `config/company.ts` |
| 5 | 이용약관·개인정보처리방침의 사업자 표기 갱신 | `app/(main)/terms`, `privacy` |
| 6 | 재배포 후 sitemap·robots 반영 확인 | - |

> 4번은 **등록이 실제로 끝난 뒤에만** 한다. 등록 전에 켜면 커뮤니티가 미등록
> 자문 서비스를 광고하는 모양이 된다 (PRD §3.4).

**전부 `config/company.ts` 한 파일이다.** 자문사 트랙이 별도 웹사이트로
나가면서(PRD §3.4 · O-9) 이 저장소에서 전환할 게이트가 없어졌다. 전환 작업이
커뮤니티 화면 코드에 닿았다면 사업자 정보 중앙화(§9.5)가 덜 된 것이다.

> **~~전환 리허설~~은 폐기됐다** (PRD G-6). 게이트가 없으므로 리허설할 절차도
> 없다. 남은 것은 설정 값 교체뿐이고, 그건 배포 후 푸터를 눈으로 확인하면 된다.

---

## 10. 보안 · 운영 체크리스트 (배포 전 필수)

> 아래 항목이 전부 완료되기 전에는 실사용 오픈하지 않는다.

### 10.1 키 관리

- [ ] `.env.local`이 `.gitignore`에 포함되어 있고, 저장소 전체 이력에 키가 없는지 확인
- [ ] 공개 배포물에는 **anon(공개) 키만** 포함. `NEXT_PUBLIC_` 접두사가 붙은 값은 전부 공개된다고 간주
- [ ] **service_role 키는 애플리케이션에서 사용하지 않는다.** 불가피하면 서버 환경변수로만 주입하고 클라이언트 경로에서는 참조 금지
- [ ] 서비스 롤 키나 접속 토큰이 한 번이라도 커밋·공유·로그 출력되었다면 **즉시 재발급.** 이 키 하나로 접근 제어가 통째로 우회된다
- [ ] 배포 환경(Vercel)과 로컬의 환경변수를 분리 관리

### 10.2 이메일

- [ ] 이메일 확인(Confirm email) **활성화** — 끄면 남의 이메일로도 무제한 가입이 가능하다
- [ ] Supabase 내장 메일러 대신 **커스텀 SMTP 연결** (Resend / SendGrid / Amazon SES / Postmark). 내장 메일러는 발송 한도가 낮고 스팸으로 분류되기 쉽다
- [ ] 발신 도메인 SPF · DKIM · DMARC 설정
- [ ] 인증 메일 · 재설정 메일 템플릿 한글화 및 실제 수신 테스트

### 10.3 비밀번호

- [ ] 최소 길이 10자 + 복잡도 규칙 적용 (최소 길이만으로는 약하다)
- [ ] **유출 비밀번호 차단(HaveIBeenPwned) 활성화**
- [ ] 비밀번호 재설정 응답이 계정 존재 여부를 노출하지 않음

### 10.4 남용 방어

- [ ] 회원가입 · 로그인 · 비밀번호 재설정에 **사람 확인(CAPTCHA)** 적용 (hCaptcha / Turnstile)
- [ ] 인증 관련 요청에 **요청 제한(rate limit)** 설정 — 봇의 대량 가입·요청 차단
- [ ] 글·댓글 작성에 도배 방지 쿨다운 (예: 동일 사용자 30초 내 재작성 제한)
- [ ] 동일 IP 대량 가입 모니터링

### 10.5 접근 제어

- [ ] **모든 표에 행 수준 보안(RLS) 활성화** — 신규 테이블 추가 시 마이그레이션에 반드시 포함
- [ ] 서버 권한으로 도는 `SECURITY DEFINER` 함수는 꼭 필요한 역할에만 `grant execute`, `public`에서는 `revoke`
- [ ] Supabase **Security Advisor / Performance Advisor를 정기 실행**해 빠진 정책을 잡는다. 경고 0건 유지
- [ ] RLS 정책별 테스트 케이스 작성 (비회원 / 타인 / 본인 / 관리자 4가지 시나리오)
- [ ] 관리자 전용 화면은 `proxy.ts` + 서버 컴포넌트 **이중 확인**

### 10.6 도메인 · 주소

- [ ] 자체 도메인 연결 및 HTTPS 강제 (HTTP → HTTPS 리다이렉트)
- [ ] Supabase **Site URL**을 실제 배포 도메인으로 설정
- [ ] **Redirect URL 허용 목록**에 배포 도메인과 로컬 개발 주소만 등록 (와일드카드 금지)
- [ ] 로그인 뒤 돌아오는 주소와 인증 메일 링크가 배포 도메인으로 정확히 연결되는지 실기기 테스트

### 10.7 운영 기본기

- [ ] DB 자동 백업 활성화 및 **복구 절차를 1회 실제로 리허설**
- [ ] 오류 추적(Sentry) 및 서버 로그·모니터링 연결
- [ ] 개인정보 보관·파기 정책 확정: 수집 항목(이메일·닉네임), 보유 기간, 탈퇴 시 파기 절차 → 개인정보처리방침에 반영
- [ ] 관리자 삭제 행위 감사 로그가 실제로 남는지 확인
- [ ] 장애 시 연락 체계 및 점검 페이지 준비

### 10.8 무료 티어 한계

- [ ] Supabase 무료 프로젝트는 **일정 기간 미사용 시 일시 정지**되고, DB 용량·메일 발송 한도가 있다 — 실사용 규모가 되면 유료 전환
- [ ] Vercel 무료 플랜은 **상업적 사용에 제한**이 있다 — 자문사 운영 사이트라면 유료 플랜 검토
- [ ] 콜드 스타트로 첫 응답이 느려지는 구간 확인
- [ ] 전환 시점 기준을 미리 정의 (예: 회원 500명 또는 월 방문 10,000회)

### 10.9 트랙 분리 · 규제 표기 점검

**커뮤니티 트랙 불변조건 (PRD §3.2)**

- [ ] **I-1** 운영자 계정의 게시물이 서비스 운영 공지로만 구성되어 있는지 확인. 시황·종목 의견 게시물 없음
- [ ] **I-2** 유료 기능이 커뮤니티 편의(광고 제거·용량·뱃지)에 한정되고, 투자정보 열람 대가가 아닌지 확인
- [ ] **I-2** 이용자에게 요금을 받는 기능이 존재하지 않는지 확인 (전 기능 무료)
- [ ] **I-3** 인기글 정렬이 조회·반응 수인지, 종목 순위가 공개 지표의 기계적 집계이고 **집계 기준 + 매수·매도 권유 아님 고지**가 화면에 있는지 확인
- [ ] **I-4** 수익률 인증·랭킹·계좌 연동 손익 기능이 존재하지 않는지 확인
- [ ] **I-5** 시세·뉴스·공시에 출처·시점이 표기되고, 운영자 논평이 붙지 않았는지 확인
- [ ] PRD §3.3 금지 기능 목록의 키가 `CommunityFeature` 에 추가되지 않았는지 확인 (`features.test.ts`)
- [ ] 관리자 운영 수칙 문서화 및 운영자 숙지 (PRD D-5)

**자문사 트랙이 이 사이트에 없는지**

- [ ] `/company` · `/advisory` · `/research` 가 404 인지 (`tests/rls/abuse.test.ts` 가 고정)
- [ ] `COMPANY.advisorySiteUrl` 이 `null` 인지 — **자문업 등록 전에는 반드시 null** (PRD §3.4)
- [ ] sitemap.xml 에 자문사 경로가 없는지

**표기**

- [ ] 사업자 정보 문자열이 `config/company.ts` 외의 파일에 하드코딩되어 있지 않은지 전체 검색으로 확인
- [ ] **형식만 맞춘 더미 사업자등록번호·주소·전화번호가 없는지 확인** (허위 표기로 읽힐 수 있다)
- [ ] 서비스명에 `자문`, `투자자문`, `자산운용` 등 인허가 연상 표현이 없는지 확인 (PRD C-8)
- [ ] 헤더·타이틀·OG 태그·메일 템플릿 전부에 `(가칭)` 표기가 반영되었는지 확인
- [ ] 전 페이지 푸터에 부록 A-2 고지(서비스 성격 + 투자 유의)와 운영 주체 표기가 노출되는지 확인
- [ ] 글 상세 하단에 작성자 책임 고지(PRD D-1)가 노출되는지 확인
- [ ] 이용약관에 시세조종·허위사실 게시물 삭제 근거(PRD D-2)가 포함되었는지 확인
- [ ] 가입 약관 동의에 **투자 유의 고지**가 필수 항목으로 포함되었는지 확인

**법률**

- [ ] **부록 A 고지문 3종 및 §3.2 불변조건의 변호사 검토 완료** (PRD O-2)
- [ ] 서비스명 상표 인접성 확인 — KIPO 상표검색 (PRD §1.1-4)
- [ ] 도메인 가용성 및 취득 완료 (PRD §1.1-5)

---

## 11. 개발 순서 (작업 티켓)

> **진행 현황 (2026-09-08)** — 배포 완료. 프로덕션에서 실제 동작 검증함.
> 주소: https://namjosunhero.vercel.app (색인 차단 상태)
>
> **프로덕션에서 검증한 것**
> - 인증: 로그인, 세션 유지, 가드 3경로(`/write` `/admin` `/settings` → `/login?redirect=`)
> - 게시판: 작성 → 수정 → 소프트 삭제. 삭제 후 목록·상세·anon REST 모두에서 사라짐
> - 마크다운: h2·강조·목록·인용·표 렌더. **sanitize 실측** — `<script>`
>   `<img onerror>` `<iframe>` `<div style>` `javascript:` 전부 제거,
>   정상 링크에 `rel="nofollow noopener noreferrer"` 적용
> - 댓글: 작성·답글·소프트 삭제. 삭제 시 자리 남고 답글 트리 유지
> - **깊이 제한: UI 를 우회해 2단계 대댓글을 시도해도 DB 트리거가 차단**
> - 트리거: `comment_count` 가 실제 수와 항상 일치 (2 → 삭제 후 1)
> - RLS(anon): 읽기 허용, 쓰기 `42501` 차단, 카테고리 수정 0행
>
> **프로덕션에서 재확인된 기능 누락**
> | 요구사항 | 증상 |
> |---|---|
> | F-503 공지 작성 | 관리자도 공지 카테고리를 고를 수 없다. `PostForm` 이 `write_role='user'` 만 필터해서 `/write?category=notice` 가 조용히 자유게시판으로 떨어진다 |
> | F-209 공지 고정 | `is_pinned` 를 설정하는 UI 가 없다. 정렬만 구현됨 |
> | F-303 댓글 수정 | `updateCommentAction` 을 호출하는 UI 가 없다. 삭제만 가능 |
> | F-208 조회수 | 중복 방지 미구현. 방문마다 증가 (3회 확인) |
>
> **아직 검증 못 한 것** — 회원이 1명뿐이어서 확인 불가
> - 감사 로그(D-4): 관리자가 **타인** 글을 삭제해야 기록된다
> - RLS 의 타인 글 수정·삭제 차단
> - 가입·비밀번호 재설정 흐름 전체 (메일 발송이 막혀 있음, §4.7)
>
> **미착수**: T-03(Pretendard 폰트) · 테스트 전무(§12 가 Phase 1 완료 조건으로
> 명시한 RLS 4역할·게이트·E2E) · §10 체크리스트 다수(SMTP·CAPTCHA·rate
> limit·백업·Sentry)
>
> **다음**: 위 기능 누락 4개 → 둘째 계정으로 권한 검증 → 테스트 작성

### Phase 0 — 기반

| # | 작업 | 완료 기준 |
|---|---|---|
| T-01 | Next.js + TS + Tailwind 프로젝트 생성, Git 초기화 | 로컬 기동 |
| T-02 | Supabase 프로젝트 생성, 환경변수 세팅, `.env.local.example` 작성 | 연결 확인 |
| T-03 | 디자인 토큰 · 기본 UI 컴포넌트 | 버튼/입력/뱃지 렌더 |
| T-04 | **설정 중앙화 골격** (`config/company.ts` · `features.ts` · `legal.ts`) (§9.5~9.7) | 설정 변경이 화면에 반영됨 |
| T-05 | 레이아웃 셸 (헤더 / 사이드바 / 하단 탭 / **푸터 고지 포함**) | 3개 브레이크포인트 확인 |
| T-06 | **Vercel 배포 파이프라인 연결** | 실제 URL 접속 성공 |

> T-06을 마지막으로 미루지 않는다. 빈 화면이라도 배포 경로를 먼저 뚫는다.
> T-04를 레이아웃보다 먼저 한다. 나중에 중앙화하면 하드코딩된 회사 정보를 걷어내는 작업이 생긴다.

### Phase 1 — MVP

| # | 작업 | 완료 기준 |
|---|---|---|
| T-07 | DB 마이그레이션 (§4.2 스키마 + 시드 카테고리) | 테이블 생성 |
| T-08 | 트리거·함수 (§4.3) | 가입 시 프로필 자동 생성 |
| T-09 | RLS 정책 (§4.4) + 4역할 테스트 | 정책 테스트 통과 |
| T-10 | Supabase 클라이언트 3종 + `proxy.ts` 세션 갱신 | 새로고침 후 로그인 유지 |
| T-11 | 회원가입 (약관 동의 · 닉네임 중복 · **준비 상태 고지 필수 동의**) | 인증 메일 수신·활성화 |
| T-12 | 로그인 / 로그아웃 / 비밀번호 재설정 | 전 흐름 동작 |
| T-13 | 카테고리 목록 · 글 목록 · 페이지네이션 | 목록 렌더 |
| T-14 | 글 작성 · 수정 · 삭제 (마크다운 + sanitize) | CRUD 완료 |
| T-15 | 글 상세 · 조회수 | 상세 렌더 |
| T-16 | 댓글 · 대댓글 1단계 · 수정 · 삭제 | 댓글 수 일치 |
| T-17 | 홈 통합 피드 | 최신글 노출 |
| T-18 | 프로필 설정 (닉네임 변경 · 비밀번호 변경) | 저장 반영 |
| T-19 | 정책 페이지 3종 (`/terms` `/privacy` `/disclaimer`) + **PRD 부록 A 문안 반영** (D-1·D-2 조항 포함) | 전 페이지 노출 |
| T-20 | **서비스 소개 `/about`** — 커뮤니티 소개 및 운영 원칙(I-1~I-4) 게시. 게이트 없음 | 공개 확인 |
| T-21 | **자문사 트랙 게이트 적용** — `/company` 준비 중 페이지, `/advisory` 404 | 직접 URL 접근 검증 |
| T-22 | sitemap · robots 게이트 연동 | `hidden`·`under_construction` 경로 제외 확인 |
| T-23 | 관리자 최소 기능 (강제 삭제 · 공지 작성 · 감사 로그) | 관리자 계정 검증 |
| T-24 | 오류/빈 상태/스켈레톤, 메타태그 | Lighthouse 확인 |
| T-25 | **§10 보안·운영 체크리스트 전 항목 완료** (§10.9 트랙 분리·규제 표기 포함) | 체크리스트 100% |
| ~~T-26~~ | ~~전환 리허설~~ → **폐기 (v0.4).** 자문사 트랙을 별도 웹사이트로 분리해 리허설할 게이트가 없다 (PRD §3.4 · G-6) | — |
| T-27 | 실기기 QA (iOS Safari / Android Chrome) | QA 시트 통과 |

---

## 12. 테스트 전략

| 계층 | 대상 | 도구 |
|---|---|---|
| DB | RLS 정책 (비회원/타인/본인/관리자 4역할 × 주요 테이블) | SQL 스크립트 |
| 게이트 | 3개 상태 × 라우트·링크·sitemap 동작 (§9.6 표 그대로) | Vitest + Playwright |
| 트랙 분리 | 커뮤니티 라우트가 `COMPANY.incorporation`·`advisory` 값과 무관하게 200을 반환하는지 (설립 전/후 두 설정으로 실행) | Playwright |
| 단위 | zod 스키마, 마크다운 sanitize, 날짜 포맷, `companyField()` null 처리 | Vitest |
| 통합 | Server Actions (권한 경계 중심) | Vitest + 테스트 DB |
| E2E | 가입 → 로그인 → 글 작성 → 댓글 → 삭제 | Playwright (핵심 1개 시나리오) |
| 수동 | 반응형 3종, 실기기 2종 | QA 체크리스트 |

**최소 기준**: RLS 정책 테스트, 게이트 상태 테스트, 트랙 분리 테스트, E2E 핵심 시나리오 1개는 Phase 1 완료 조건이다. 나머지는 여유가 있을 때 채운다.

게이트·트랙 테스트가 필수인 이유는 양방향이다. `hidden` 이 실제로 404를 내지 않으면 미신고 상태에서 자문 콘텐츠가 노출되고, 반대로 커뮤니티 라우트가 규제 설정에 반응하면 자문사 절차가 커뮤니티 운영을 볼모로 잡는다. 둘 다 UI 버그가 아니라 사업 리스크다.

---

## 13. 미해결 기술 이슈

| # | 이슈 | 결정 시점 |
|---|---|---|
| TI-1 | 조회수 정확도 — 서버 측 중복 방지 도입 여부 | Phase 2 |
| TI-2 | 오프셋 → 커서 페이지네이션 전환 시점 | 글 5,000건 도달 시 |
| TI-3 | 이미지 업로드 저장소 (Supabase Storage vs 외부 CDN) | Phase 2 |
| TI-4 | 검색 방식 (Postgres FTS vs 외부 검색 엔진) — 한글 형태소 분석 필요 | Phase 2 |
| TI-5 | 회원 등급별 열람 제한을 RLS로 할지 애플리케이션에서 할지 | Phase 3 |
| TI-6 | Supabase 락인 해소 — 자체 Postgres 이관 검토 | Phase 4 |
