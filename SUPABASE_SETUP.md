# Supabase 연결 절차

코드는 전부 준비되어 있다. 아래를 따라가면 시드 모드가 실 DB 로 바뀐다.
화면의 `데이터베이스 미연결` 안내는 키가 채워지면 자동으로 사라진다.

각 항목은 [TECH_SPEC.md §10](TECH_SPEC.md) 보안·운영 체크리스트와 대응한다.

---

## 1. 프로젝트 생성

1. https://supabase.com 에서 로그인 → **New project**
2. 설정
   - **Region**: `Northeast Asia (Seoul)` — 국내 사용자 대상이므로 지연이 가장 낮다
   - **Database Password**: 강한 비밀번호로 생성해 비밀번호 관리자에 저장. 이 값은 앱에서 쓰지 않는다
   - **Plan**: Free 로 시작

> 무료 프로젝트는 일정 기간 미사용 시 일시 정지된다. 실사용 전에 유료 전환이 필요하다 (§10.8).

## 2. 스키마 적용

Dashboard → **SQL Editor** → New query → [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) 전체를 붙여넣고 **Run**.

적용되는 것:

- 테이블 5개 (`profiles` `categories` `posts` `comments` `audit_logs`)
- 카테고리 시드 5건 (공지·자유·종목·시황·질문)
- 함수 4개 (`is_admin` `is_nickname_available` `increment_view_count` 등)
- 트리거 4개 (프로필 자동 생성, 댓글 수 동기화, 대댓글 깊이 제한)
- **모든 테이블 RLS 활성화 + 정책 13개**

확인: Table Editor 에서 각 테이블에 방패 아이콘(RLS 활성)이 보이면 정상이다.

## 3. 환경변수

Dashboard → **Project Settings → API** 에서 두 값을 복사한다.

| 항목 | 넣을 곳 |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` 키 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3200
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

> **`service_role` 키는 복사하지 않는다.** 이 프로젝트는 사용하지 않으며, 이 키 하나로 RLS 가 통째로 우회된다. 실수로 어딘가에 붙여 넣었다면 같은 화면에서 즉시 재발급할 것 (§10.1).

개발 서버를 재시작한다. `.env.local` 은 기동 시점에만 읽힌다.

```bash
npm run dev
```

## 4. 인증 설정 (필수)

Dashboard → **Authentication** 에서 아래를 설정한다. **하나도 건너뛰지 않는다.**

### 4.1 이메일 확인 (§10.2)

**Sign In / Providers → Email**

- [ ] **Confirm email** 활성화 — 끄면 남의 이메일로 무제한 가입이 가능하다

### 4.2 비밀번호 정책 (§10.3)

**Sign In / Providers → Email → Password settings** (또는 Auth Settings)

- [ ] Minimum password length: **10**
- [ ] Password requirements: 영문·숫자·특수문자 조합 요구
- [ ] **Leaked password protection 활성화** (HaveIBeenPwned) — 이미 유출된 비밀번호를 차단한다

### 4.3 URL 설정 (§10.6)

**URL Configuration**

| 항목 | 값 |
|---|---|
| Site URL | `http://localhost:3200` (배포 후 실제 도메인으로 변경) |
| Redirect URLs | `http://localhost:3200/auth/callback` |

배포 후 추가: `https://<도메인>/auth/callback`

- [ ] **와일드카드를 쓰지 않는다.** 정확한 경로만 등록한다

### 4.4 커스텀 SMTP (실사용 전 필수, §10.2)

로컬 테스트는 내장 메일러로 충분하지만 발송 한도가 낮고 스팸으로 분류되기 쉽다.

**Project Settings → Authentication → SMTP Settings** 에서 Resend / SendGrid / Amazon SES / Postmark 중 하나를 연결한다.

- [ ] 발신 도메인 SPF · DKIM · DMARC 설정
- [ ] 인증 메일 · 재설정 메일 템플릿 한글화
- [ ] 실제 수신 테스트

### 4.5 남용 방어 (실사용 전 필수, §10.4)

- [ ] **Attack Protection → CAPTCHA** 활성화 (hCaptcha 또는 Cloudflare Turnstile)
- [ ] **Rate Limits** 에서 가입·로그인·메일 발송 한도 확인 및 조정

> CAPTCHA 를 켜면 클라이언트에 토큰을 실어 보내야 한다. 코드 수정이 필요하므로 실사용 오픈 직전에 함께 작업한다.

## 5. 관리자 계정 만들기

1. 앱에서 `/signup` 으로 가입하고 메일 인증을 완료한다
2. Dashboard → **SQL Editor** 에서 역할을 올린다

```sql
update public.profiles
   set role = 'admin'
 where nickname = '내닉네임';
```

3. 로그아웃 후 다시 로그인하면 헤더에 `관리자` 링크가 보인다

## 6. 동작 확인

| # | 확인 | 기대 |
|---|---|---|
| 1 | 홈 접속 | `데이터베이스 미연결` 안내가 사라짐. 목록이 비어 있음 (시드 글은 DB 에 없다) |
| 2 | `/signup` 가입 | 인증 메일 수신 → 링크 클릭 → 홈으로 복귀 |
| 3 | `/write` 글 작성 | 등록 후 상세로 이동 |
| 4 | 상세에서 댓글·답글 | 목록의 댓글 수가 일치 |
| 5 | 답글에 다시 답글 | `대댓글은 1단계까지만 작성할 수 있습니다` |
| 6 | 본인 글 수정·삭제 | 목록에서 사라짐 |
| 7 | 로그아웃 상태로 `/write` | `/login?redirect=/write` 로 이동 |
| 8 | 일반 계정으로 `/admin` | 404 |
| 9 | 일반 계정으로 공지 카테고리 작성 | 카테고리 선택 목록에 안 보이고, 강제로 보내도 DB 가 거부 |
| 10 | 관리자로 타인 글 삭제 | 삭제되고 `audit_logs` 에 기록 |

## 7. RLS 정책 검증 (§10.5)

SQL Editor 에서 역할을 바꿔가며 정책이 실제로 막는지 확인한다. **애플리케이션을 통하지 않고 DB 에 직접 물어보는 것이 요점이다.**

```sql
-- 비회원(anon): 삭제된 글이 안 보여야 한다
set role anon;
select count(*) from public.posts where is_deleted = true;  -- 0 이어야 한다
reset role;
```

```sql
-- 타인 글 수정 시도: 0 rows 여야 한다 (권한 없음)
-- <uuid> 는 실제 사용자 id 로 바꿀 것
set local role authenticated;
set local request.jwt.claims = '{"sub":"<다른-사용자-uuid>","role":"authenticated"}';
update public.posts set title = '탈취' where id = 1 returning id;
reset role;
```

- [ ] 4역할(비회원 / 타인 / 본인 / 관리자) × 주요 테이블 검증
- [ ] Dashboard → **Advisors → Security Advisor** 실행, 경고 0건

## 8. 시드 제거

실 DB 확인이 끝나면 시드 코드를 지운다.

1. `src/lib/data/seed.ts` 삭제
2. `src/lib/data/queries.seed.ts` 삭제
3. `src/lib/data/queries.ts` 를 아래로 단순화

```ts
export * from "./queries.supabase";
export { POSTS_PER_PAGE } from "./types";
export type { PostsQuery, PostsResult } from "./types";
```

4. `isSeedMode()` 호출부 제거 — `PendingNotice` 를 쓰는 4곳
   (`/write` `/login` `/signup` `/reset-password` `/settings` `/admin`)
5. `src/components/ui/PendingNotice.tsx` 삭제

`grep -rn "isSeedMode\|PendingNotice\|data/seed" src/` 결과가 비면 완료다.

## 9. 타입 재생성

손으로 유지하던 타입을 실제 스키마에서 뽑아 덮어쓴다.

```bash
npx supabase gen types typescript --project-id <프로젝트-ref> > src/types/database.ts
```

`<프로젝트-ref>` 는 Project URL 의 `https://<ref>.supabase.co` 부분이다.

---

## 배포 전 남은 것

이 문서는 연결까지만 다룬다. 실사용 오픈 전에는 [TECH_SPEC.md §10](TECH_SPEC.md) 전체를 통과해야 한다. 특히 아직 안 된 것:

- 커스텀 SMTP (4.4)
- CAPTCHA + rate limit (4.5)
- 도배 방지 쿨다운
- 자체 도메인 + HTTPS, Site URL 갱신
- DB 백업 활성화 및 **복구 절차 1회 리허설**
- 오류 추적(Sentry) 연결
- 개인정보 보관·파기 정책 확정
- §10.9 트랙 분리·규제 표기 점검
- **법적 고지문 변호사 검토** (PRD 부록 A)
