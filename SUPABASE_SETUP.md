# Supabase 연결 절차

코드는 전부 준비되어 있다. 아래를 따라가면 시드 모드가 실 DB 로 바뀐다.
화면의 `데이터베이스 미연결` 안내는 키가 채워지면 자동으로 사라진다.

각 항목은 [TECH_SPEC.md §10](TECH_SPEC.md) 보안·운영 체크리스트와 대응한다.

> **대시보드가 개편되었다.** Supabase 는 서비스별 설정을 각 서비스 영역으로
> 옮겼다 (예: 이전 `Project Settings → Database` → 현재 `Database → Configuration`).
> 옛 링크는 리다이렉트되고 `Project Settings` 에 한동안 바로가기가 남아 있으므로,
> 아래 경로에서 항목이 안 보이면 **왼쪽 사이드바의 해당 서비스 아이콘 → 하위 설정**
> 을 찾으면 된다.
>
> **API 키 체계도 바뀌었다.** `sb_publishable_...` / `sb_secret_...` 가
> 기존 `anon` / `service_role` JWT 키를 대체하며, 옛 키는 **2026년 말 폐기 예정**이다.
> 권한 수준은 같으므로 RLS 동작은 동일하고 값만 바꿔 끼우면 된다.

---

## 1. 프로젝트 생성

1. https://supabase.com/dashboard 로그인
2. **New project** 클릭
3. 입력
   - **Name**: `yeongung-hogeol` (자유)
   - **Database Password**: **Generate a password** 를 눌러 생성하고 비밀번호 관리자에 저장.
     이 값은 앱에서 쓰지 않는다. DB 에 직접 접속할 때만 필요하다
   - **Region**: `Northeast Asia (Seoul)` — 국내 사용자 대상이라 지연이 가장 낮다
   - **Pricing Plan**: Free
4. **Create new project** → 프로비저닝 1~2분 대기

> Free 프로젝트는 일정 기간 미사용 시 일시 정지된다. 또한 **§4.2 의 유출 비밀번호
> 차단은 Pro 플랜 전용**이다. 실사용 전 유료 전환이 필요하다 (§10.8).

## 2. 스키마 적용

1. 왼쪽 사이드바 **SQL Editor**
2. **New query**
3. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) 파일을 열어
   **전체 선택 → 복사 → 붙여넣기**
4. **Run** (또는 `Ctrl+Enter`)
5. `Success. No rows returned` 이 나오면 정상

적용되는 것:

- 테이블 5개 (`profiles` `categories` `posts` `comments` `audit_logs`)
- 카테고리 시드 5건 (공지·자유·종목·시황·질문)
- 함수 4개 (`is_admin` `is_nickname_available` `increment_view_count` `handle_new_user`)
- 트리거 4개 (프로필 자동 생성, 댓글 수 동기화, 대댓글 깊이 제한)
- **모든 테이블 RLS 활성화 + 정책 13개**

**확인**: 사이드바 **Table Editor** → 테이블 5개가 보이고, 각 테이블 이름 옆에
`RLS enabled` 표시가 있으면 정상이다.

---

## 3. 환경변수 채우기

가져올 값은 **두 개**뿐이다. 두 가지 방법이 있고, **3-A 가 더 빠르고 확실하다.**

| 넣을 곳 | 무엇 | 형태 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 프로젝트 URL | `https://xxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 공개 키 | `sb_publishable_...` |

### 3-A. Connect 버튼으로 한 번에 (권장)

메뉴가 개편되어도 이 버튼은 그대로 있고, 두 값이 한 화면에 나온다.

1. 프로젝트 대시보드 **상단 헤더의 `Connect` 버튼** 클릭
2. 프레임워크 탭에서 **Next.js** 선택
3. `.env.local` 용 스니펫이 나온다. 아래 두 줄을 복사한다
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - 공개 키 한 줄 (`sb_publishable_...`)

> 스니펫의 변수 이름이 이 프로젝트와 다를 수 있다 (`..._ANON_KEY` 또는
> `..._PUBLISHABLE_KEY`). **값만 가져와서** 아래 3-C 의 변수 이름에 붙인다.
> 두 이름 모두 코드가 읽지만 `PUBLISHABLE` 쪽을 우선한다.

### 3-B. 설정 화면에서 따로 가져오기

Connect 버튼을 못 찾겠으면 두 곳에서 하나씩 가져온다.

**프로젝트 URL**

1. 왼쪽 사이드바 맨 아래 **⚙ Project Settings**
2. **Data API**
3. **Project URL** 항목의 값을 복사 (`https://xxxxxxxx.supabase.co`)

**공개 키**

1. **⚙ Project Settings** → **API Keys**
2. **`Publishable and secret API keys` 탭** 선택
3. **Publishable key** 의 값을 복사 (`sb_publishable_...`)

> 같은 화면의 **Secret keys** (`sb_secret_...`) 는 **복사하지 않는다.**
> 이 프로젝트는 쓰지 않으며, 이 키 하나로 RLS 가 통째로 우회된다.
> 실수로 어딘가에 붙여 넣었다면 같은 화면에서 즉시 **Revoke** 후 재발급할 것 (§10.1).
>
> `Legacy API keys` 탭의 `anon` / `service_role` 은 폐기 예정이므로 신규
> 프로젝트에서는 쓰지 않는다.

### 3-C. 파일에 넣기

프로젝트 폴더에서:

```bash
cp .env.local.example .env.local
```

`.env.local` 을 열어 **`=` 뒤에만** 값을 붙인다. 따옴표·공백 없이.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3200
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx
```

### 3-D. 반영

**개발 서버를 반드시 재시작한다.** `.env.local` 은 기동 시점에만 읽힌다.

```bash
npm run dev
```

**확인**: `/signup` 에서 `데이터베이스 미연결` 안내가 사라지면 성공이다.
안 사라졌다면 — 서버를 재시작했는지, `=` 뒤에 값이 실제로 들어갔는지,
변수 이름 앞의 `#` 을 지웠는지 확인한다.

> `.env.local` 은 `.gitignore` 의 `.env*` 규칙으로 커밋되지 않는다.
> `.env.local.example` 만 예외로 추적된다.

---

## 4. 인증 설정

왼쪽 사이드바 **Authentication** 에서 설정한다. **하나도 건너뛰지 않는다.**

### 4.1 이메일 확인 (§10.2) — 필수

1. **Authentication** → **Sign In / Providers**
2. Auth Providers 목록에서 **Email** 클릭해 펼치기
3. **Confirm email** 을 **켠다**
4. **Save**

> 끄면 남의 이메일 주소로도 무제한 가입이 가능하다.

### 4.2 비밀번호 정책 (§10.3)

같은 화면(**Sign In / Providers → Email**) 안에 있다.

1. **Minimum password length**: `10`
2. **Password Requirements**: 문자 종류 조합을 요구하는 항목 선택
   (영문 + 숫자 이상)
3. **Leaked password protection** 켜기 — HaveIBeenPwned 로 이미 유출된
   비밀번호를 차단한다
4. **Save**

> ⚠️ **유출 비밀번호 차단은 Pro 플랜 이상에서만 제공된다.** Free 플랜에서는
> 항목이 비활성으로 보인다. 최소 길이·문자 조합은 Free 에서도 설정된다.
> 유료 전환 시 이 항목을 켜는 것을 잊지 말 것.
>
> 앱 쪽에도 같은 규칙이 있다 (`src/lib/validations/schemas.ts` — 10자 이상,
> 영문·숫자·특수문자 중 2종 이상). 대시보드 값을 바꾸면 이 파일도 맞춰야 한다.

### 4.3 URL 설정 (§10.6) — 필수

인증 메일의 링크가 앱으로 돌아오는 경로다. **틀리면 가입이 완료되지 않는다.**

1. **Authentication** → **URL Configuration**
2. **Site URL**: `http://localhost:3200`
3. **Redirect URLs** → **Add URL**: `http://localhost:3200/auth/callback`
4. **Save**

배포 후 추가할 것:

- Site URL 을 `https://<도메인>` 으로 변경
- Redirect URLs 에 `https://<도메인>/auth/callback` 추가
- `.env.local` (또는 Vercel 환경변수) 의 `NEXT_PUBLIC_SITE_URL` 도 같이 변경

> Supabase 는 와일드카드(`**`)를 허용하지만 **쓰지 않는다.** 정확한 경로만
> 등록한다 — 와일드카드는 의도치 않은 주소로 인증 코드가 전달될 여지를 만든다.

### 4.4 커스텀 SMTP (실사용 전 필수, §10.2)

로컬 테스트는 내장 메일러로 충분하지만, 발송 한도가 매우 낮고(시간당 소수)
스팸으로 분류되기 쉽다.

1. **Project Settings** → **Authentication** → **SMTP Settings**
   (또는 **Authentication** → **Emails** → SMTP 항목)
2. **Enable Custom SMTP** 켜기
3. Resend / SendGrid / Amazon SES / Postmark 중 하나의 SMTP 정보 입력

- [ ] 발신 도메인 SPF · DKIM · DMARC 설정
- [ ] **Authentication → Emails** 에서 인증 메일·재설정 메일 템플릿 한글화
- [ ] 실제 메일 수신 테스트

### 4.5 남용 방어 (실사용 전 필수, §10.4)

1. **Authentication** → **Attack Protection**
   - [ ] **CAPTCHA protection** 켜기 (hCaptcha 또는 Cloudflare Turnstile)
2. **Authentication** → **Rate Limits**
   - [ ] 가입·로그인·메일 발송 한도 확인 및 조정

> CAPTCHA 를 켜면 클라이언트가 토큰을 함께 보내야 하므로 **코드 수정이 따른다.**
> 켜자마자 가입이 막히므로, 실사용 오픈 직전에 코드 작업과 함께 진행한다.

---

## 5. 관리자 계정 만들기

1. 앱에서 `/signup` 으로 가입 → 받은 메일의 링크 클릭 → 인증 완료
2. Supabase **SQL Editor** 에서 역할을 올린다 (`내닉네임` 을 실제 값으로)

```sql
update public.profiles
   set role = 'admin'
 where nickname = '내닉네임';
```

3. 앱에서 로그아웃 후 다시 로그인하면 헤더에 `관리자` 링크가 보인다

## 6. 동작 확인

| # | 확인 | 기대 |
|---|---|---|
| 1 | 홈 접속 | `데이터베이스 미연결` 안내 사라짐. 목록은 비어 있음 (시드 글은 DB 에 없다) |
| 2 | `/signup` 가입 | 인증 메일 수신 → 링크 클릭 → 홈으로 복귀 |
| 3 | `/write` 글 작성 | 등록 후 상세로 이동 |
| 4 | 상세에서 댓글·답글 | 목록의 댓글 수가 일치 |
| 5 | 답글에 다시 답글 | `대댓글은 1단계까지만 작성할 수 있습니다` |
| 6 | 본인 글 수정·삭제 | 목록에서 사라짐 |
| 7 | 로그아웃 상태로 `/write` | `/login?redirect=/write` 로 이동 |
| 8 | 일반 계정으로 `/admin` | 404 |
| 9 | 일반 계정으로 공지 카테고리 작성 | 선택 목록에 안 보이고, 강제로 보내도 DB 가 거부 |
| 10 | 관리자로 타인 글 삭제 | 삭제되고 `audit_logs` 에 기록 |
| 11 | 짧은 비밀번호로 가입 | `비밀번호는 10자 이상이어야 합니다.` |
| 12 | 중복 닉네임으로 가입 | `이미 사용 중인 닉네임입니다.` |

## 7. RLS 정책 검증 (§10.5)

SQL Editor 에서 역할을 바꿔가며 정책이 실제로 막는지 확인한다.
**애플리케이션을 통하지 않고 DB 에 직접 물어보는 것이 요점이다.**

```sql
-- 비회원(anon): 삭제된 글이 안 보여야 한다
set local role anon;
select count(*) from public.posts where is_deleted = true;  -- 0 이어야 한다
reset role;
```

```sql
-- 타인 글 수정 시도: 0 rows 여야 한다 (권한 없음)
-- <uuid> 는 실제 사용자 id 로 바꿀 것 (auth.users 에서 확인)
set local role authenticated;
set local request.jwt.claims = '{"sub":"<다른-사용자-uuid>","role":"authenticated"}';
update public.posts set title = '탈취' where id = 1 returning id;
reset role;
```

- [ ] 4역할(비회원 / 타인 / 본인 / 관리자) × 주요 테이블 검증
- [ ] **Advisors → Security Advisor** 실행, 경고 0건
- [ ] **Advisors → Performance Advisor** 실행, 누락 인덱스 확인

## 8. 시드 코드 제거

실 DB 확인이 끝나면 시드를 지운다.

1. `src/lib/data/seed.ts` 삭제
2. `src/lib/data/queries.seed.ts` 삭제
3. `src/lib/data/queries.ts` 를 아래로 단순화

```ts
export * from "./queries.supabase";
export { POSTS_PER_PAGE } from "./types";
export type { PostsQuery, PostsResult } from "./types";
```

4. `isSeedMode()` 호출부와 `PendingNotice` 제거
5. `src/components/ui/PendingNotice.tsx` 삭제
6. `src/app/(main)/settings/page.tsx` 의 `DisabledPreview` 제거,
   `src/app/(main)/admin/page.tsx` 의 시드 분기 제거

```bash
grep -rn "isSeedMode\|PendingNotice\|data/seed\|DisabledPreview" src/
```

결과가 비면 완료다. 이후 `npx tsc --noEmit` 과 `npx next build` 를 다시 돌린다.

## 9. 타입 재생성

손으로 유지하던 타입을 실제 스키마에서 뽑아 덮어쓴다.

```bash
npx supabase gen types typescript --project-id <프로젝트-ref> > src/types/database.ts
```

`<프로젝트-ref>` 는 프로젝트 URL 의 `https://<ref>.supabase.co` 부분이다.

---

## 막혔을 때

| 증상 | 원인 |
|---|---|
| `데이터베이스 미연결` 이 안 사라진다 | 개발 서버 재시작 안 함 / 변수 이름 앞 `#` 안 지움 / `=` 뒤가 빈 값 |
| 가입은 되는데 메일이 안 온다 | 스팸함 확인. 내장 메일러 시간당 한도 초과 (§4.4 로 해결) |
| 메일 링크를 누르면 `인증 링크가 만료되었거나 올바르지 않습니다` | §4.3 Redirect URLs 에 `/auth/callback` 미등록, 또는 `NEXT_PUBLIC_SITE_URL` 과 Site URL 불일치 |
| 글 작성 시 `권한이 없습니다` | 이메일 인증 미완료, 또는 공지 카테고리에 일반 계정으로 작성 시도 |
| 로그인이 자꾸 풀린다 | `proxy.ts` 가 동작하지 않는 상태. 빌드 출력에 `ƒ Proxy (Middleware)` 가 있는지 확인 |
| `Invalid API key` | Secret 키를 넣었거나 키 값이 잘린 상태. §3-A 로 다시 복사 |

## 배포 전 남은 것

이 문서는 연결까지만 다룬다. 실사용 오픈 전에는
[TECH_SPEC.md §10](TECH_SPEC.md) 전체를 통과해야 한다. 특히 아직 안 된 것:

- 커스텀 SMTP (§4.4)
- CAPTCHA + rate limit (§4.5) — **코드 수정 동반**
- 유출 비밀번호 차단 (§4.2) — **Pro 플랜 필요**
- 도배 방지 쿨다운
- 자체 도메인 + HTTPS, Site URL·Redirect URLs 갱신
- DB 백업 활성화 및 **복구 절차 1회 리허설**
- 오류 추적(Sentry) 연결
- 개인정보 보관·파기 정책 확정
- §10.9 트랙 분리·규제 표기 점검
- **법적 고지문 변호사 검토** (PRD 부록 A)
