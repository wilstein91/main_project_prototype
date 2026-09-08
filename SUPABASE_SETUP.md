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
3. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) 을 열어
   **전체 선택 → 복사 → 붙여넣기**
4. **Run** (또는 `Ctrl+Enter`)
5. `Success. No rows returned` 이 나오면 정상

적용되는 것:

- 테이블 5개 (`profiles` `categories` `posts` `comments` `audit_logs`)
- 카테고리 시드 5건 (공지·자유·종목·시황·질문)
- 함수 6개, 트리거 3개, **RLS 정책 14개** (모든 테이블 RLS 활성화)

### 2.1 `already exists` 에러가 났다면

```
ERROR: 42P07: relation "profiles" already exists
```

**이건 정상 신호다.** 앞선 실행이 이미 성공해서 테이블이 만들어져 있다는 뜻이고,
같은 스크립트를 두 번 돌리면 나오는 에러다. **아무 조치도 필요 없다.**

단, 첫 실행이 *끝까지* 갔는지는 확인해야 한다. 중간에 끊겼으면 테이블은 있는데
정책이나 트리거가 빠진 상태가 된다.

**확인 방법** — SQL Editor 에 [`supabase/verify.sql`](supabase/verify.sql) 을
붙여넣고 Run 한다. 읽기만 하므로 몇 번 돌려도 안전하다.

기대하는 결과:

| 쿼리 | 기대 |
|---|---|
| [1] | 15행 전부 `✅ 있음` |
| [2] | `rls_켜짐` 전부 `true`. 정책수 — profiles 2 / categories 2 / posts 4 / comments 4 / audit_logs 2 |
| [3] | 5행 (notice·free·stock·market·qna). `notice` 만 `admin` |

전부 맞으면 **2번 단계는 끝났다.** §3 으로 넘어간다.

**하나라도 `❌ 없음` 이면** — 첫 실행이 중간에 끊긴 것이다. 지우고 다시 한다.

1. [`supabase/reset_dev.sql`](supabase/reset_dev.sql) 을 붙여넣고 Run
   (⚠️ 게시글·프로필이 전부 삭제된다. 회원 데이터가 생긴 뒤에는 실행 금지)
2. `0001_init.sql` 을 다시 붙여넣고 Run
3. `verify.sql` 로 재확인

---

## 3. 환경변수 채우기

가져올 값은 **딱 두 개**다.

| # | 이름 | 생김새 |
|---|---|---|
| ① | 프로젝트 주소 | `https://abcdefghijklmnop.supabase.co` |
| ② | 공개 키 | `sb_publishable_` 로 시작하는 긴 문자열 |

이 두 개를 프로젝트 폴더의 `.env.local` 파일에 적으면 끝이다.

### ① 프로젝트 주소 — 브라우저 주소창을 보면 된다

메뉴를 찾아갈 필요가 없다. **지금 열려 있는 대시보드의 주소창**을 보자.

```
https://supabase.com/dashboard/project/abcdefghijklmnop
                                       └──────┬───────┘
                                         이 부분 = 프로젝트 ref
```

`project/` 다음에 오는 **20자 정도의 영문 덩어리**가 프로젝트 ref 다.
그걸 아래 형태에 끼우면 그게 프로젝트 주소다.

```
https://<ref>.supabase.co
```

예를 들어 주소창이 `.../project/abcdefghijklmnop` 이면
프로젝트 주소는 `https://abcdefghijklmnop.supabase.co` 다.

> `/settings/...` 처럼 뒤에 더 붙어 있어도 상관없다. `project/` 바로 뒤
> 한 덩어리만 쓴다.

### ② 공개 키 — 링크 하나로 바로 간다

아래 주소를 브라우저에 붙여넣는다. `_` 는 "지금 보고 있는 프로젝트" 를
뜻하므로 ref 를 몰라도 열린다.

```
https://supabase.com/dashboard/project/_/settings/api-keys
```

열리는 화면에서:

1. 탭이 두 개 보인다 — **`Publishable and secret API keys`** 와 `Legacy API keys`
2. **`Publishable and secret API keys`** 탭을 선택한다 (보통 기본 선택)
3. **`Publishable key`** 라고 적힌 항목을 찾는다. 값이 `sb_publishable_...` 로 시작한다
4. 값 옆의 **복사 아이콘**을 누른다

**이 화면에서 가져오지 말아야 할 것:**

| 항목 | |
|---|---|
| `Secret keys` (`sb_secret_...`) | ❌ 쓰지 않는다. 이 키 하나로 RLS 가 통째로 우회된다 |
| `Legacy API keys` 탭의 `anon` | ❌ 2026년 말 폐기 예정 |
| `Legacy API keys` 탭의 `service_role` | ❌ 절대 |

> 실수로 Secret 키를 어딘가에 붙여 넣었다면 같은 화면에서 **Revoke** 하고
> 새로 발급받는다 (§10.1).

### ②-대안: `Connect` 버튼 (두 값을 한 번에)

위 링크가 안 열리거나 화면이 다르면 이쪽을 쓴다.

1. 프로젝트 대시보드 **맨 위 헤더의 `Connect` 버튼** 클릭
2. 프레임워크 목록에서 **Next.js** 선택
3. `.env.local` 용 코드 블록이 나온다 — **프로젝트 주소와 공개 키가 함께** 들어 있다

> 여기 나오는 변수 **이름**은 이 프로젝트와 다를 수 있다
> (`..._ANON_KEY` 로 나올 수도 있다). **`=` 뒤의 값만** 가져와서
> 아래 ③ 의 이름에 붙인다.

### ③ `.env.local` 에 적기

프로젝트 폴더(`C:\Aiffel_Work\Main_Project`)에서:

```bash
cp .env.local.example .env.local
```

`.env.local` 을 편집기로 열면 아래 세 줄이 있다 (주석 사이에 섞여 있다).
**`=` 뒤에만** 값을 붙인다.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3200
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

채우면 이렇게 된다:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3200
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_A1b2C3d4E5f6G7h8I9j0
```

**주의 4가지**

- 따옴표를 붙이지 않는다 (`"https://..."` ❌)
- `=` 앞뒤에 공백을 넣지 않는다
- 줄 맨 앞에 `#` 이 있으면 지운다 (주석 처리되어 무시된다)
- 값 끝에 공백이나 줄바꿈이 섞이지 않게 한다

### ④ 개발 서버 재시작

`.env.local` 은 **서버가 켜질 때 한 번만** 읽힌다. 저장만 해서는 반영되지 않는다.

실행 중인 개발 서버를 끄고(`Ctrl+C`) 다시 켠다.

```bash
npm run dev
```

### ⑤ 됐는지 확인

브라우저에서 `http://localhost:3200/signup` 을 연다.

| 보이는 것 | 뜻 |
|---|---|
| `데이터베이스 미연결` 안내가 **사라졌다** | ✅ 성공. §4 로 넘어간다 |
| 안내가 그대로 있다 | ❌ 아래 확인 |

안 되면 순서대로 확인한다.

1. 개발 서버를 정말 끄고 다시 켰는가
2. 파일 이름이 `.env.local` 인가 (`.env.local.example` 이 아니라)
3. 두 줄 맨 앞에 `#` 이 남아 있지 않은가
4. `=` 뒤에 값이 실제로 붙어 있는가 — 주석을 걷어내고 확인한다

```bash
grep -v "^#" .env.local | grep .
```

세 줄이 나오고 **모두 `=` 뒤에 값이 있어야** 한다. 아래처럼 나오면 아직 안 채운 것이다.

```
NEXT_PUBLIC_SITE_URL=http://localhost:3200
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

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
3. **Redirect URLs** → **Add URL** 로 **두 개** 등록
   - `http://localhost:3200/auth/confirm`
   - `http://localhost:3200/auth/callback`
4. **Save**

> 두 경로를 모두 등록하는 이유는 §4.6 참고. `confirm` 이 이메일 링크용,
> `callback` 은 나중에 붙일 소셜 로그인용이다.

배포 후 추가할 것:

- Site URL 을 `https://<도메인>` 으로 변경
- Redirect URLs 에 `https://<도메인>/auth/confirm` 과 `.../auth/callback` 추가
- `.env.local` (또는 Vercel 환경변수) 의 `NEXT_PUBLIC_SITE_URL` 도 같이 변경

> Supabase 는 와일드카드(`**`)를 허용하지만 **쓰지 않는다.** 정확한 경로만
> 등록한다 — 와일드카드는 의도치 않은 주소로 인증 코드가 전달될 여지를 만든다.

### 4.4 커스텀 SMTP (§10.2) — 개발 중에도 곧 필요해진다

내장 메일러는 **시간당 발송 수가 매우 적고**(무료 프로젝트는 몇 통 수준)
스팸으로 분류되기 쉽다. 가입·재설정을 몇 번 시도하면 바로 소진되어 메일이
조용히 끊긴다 (§4.7 ①). 테스트를 반복할 단계라면 지금 연결하는 편이 낫다.

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

### 4.6 이메일 템플릿 변경 (필수) — 링크가 `error=auth_callback` 으로 튈 때

**증상** — 메일은 오지만, 인증 버튼이나 재설정 버튼을 누르면
`/login?error=auth_callback` 으로 이동한다.

**원인** — Supabase 기본 템플릿의 `{{ .ConfirmationURL }}` 은
`<supabase>/auth/v1/verify?token=...` 를 거쳐 앱으로 돌아온다. 이때 세션
정보가 **URL 프래그먼트(`#access_token=...`)** 로 오거나, `?code=` 로 오더라도
**발급 시점에 심어둔 쿠키(code verifier)** 가 있어야 교환된다.

- 프래그먼트는 서버가 볼 수 없다 (브라우저가 서버로 보내지 않는다)
- 쿠키 방식은 메일을 다른 브라우저·기기에서 열면 실패한다

**해결** — 템플릿을 `{{ .TokenHash }}` 형태로 바꾼다. 이 방식은 쿠키에
의존하지 않아서 어느 브라우저에서 열어도 동작한다. 서버 사이드 인증에서
권장되는 방식이다.

**Authentication** → **Emails** (또는 Email Templates) 에서 두 개를 고친다.

#### ① Confirm signup (가입 인증)

본문에서 `{{ .ConfirmationURL }}` 을 찾아 아래로 **그대로** 교체한다.

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

예를 들어 기본 본문이 이렇다면:

```html
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

이렇게 바꾼다:

```html
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">이메일 인증하기</a></p>
```

#### ② Reset password (비밀번호 재설정)

`type` 만 다르다. `recovery` 로 둔다.

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
```

```html
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">비밀번호 재설정하기</a></p>
```

> `next` 파라미터를 붙이지 않아도 된다. 앱이 `type=recovery` 를 보고
> 비밀번호 설정 화면(`/settings?reset=1`)으로 보낸다.

#### 확인

1. 템플릿 저장 후 `/signup` 에서 **새 이메일로** 다시 가입한다
   (이미 보낸 메일의 링크는 옛 템플릿이라 그대로 실패한다)
2. 메일의 링크 주소가 `.../auth/confirm?token_hash=...&type=email` 형태인지 확인
3. 링크를 누르면 홈으로 이동하고 헤더에 닉네임이 보인다

**여전히 `error=auth_callback` 이 뜨면** 주소창의 `reason` 값을 보면 원인이 나온다.

| reason | 뜻 |
|---|---|
| `no_token` | 링크에 `token_hash` 가 없다 → 템플릿이 아직 안 바뀌었다 |
| `verify_failed` | 링크 만료 또는 이미 사용됨 → 메일을 다시 받는다 |
| `bad_type` | `type` 값이 잘못됐다 → 템플릿의 `type=` 확인 |
| `exchange_failed` | 다른 브라우저에서 링크를 열었다 → 템플릿 변경으로 해결됨 |
| `upstream` | Supabase 가 요청을 거부 → 잠시 후 재시도 |
| `not_configured` | `.env.local` 미설정 |

화면에도 같은 안내가 사람 말로 표시되고 &lsquo;메일 다시 받기&rsquo; 링크가 함께 나온다.

### 4.7 메일이 아예 안 올 때

원인은 대개 아래 넷 중 하나다. **위에서부터 확인한다.**

#### ① 기본 메일러 발송 한도 초과 (가장 흔함)

Supabase 내장 메일러는 **시간당 발송 수가 매우 적다** (무료 프로젝트는 몇 통
수준). 가입·재설정을 몇 번 시도하면 바로 소진되고, 그 뒤로는 조용히 아무것도
오지 않는다. **개발 중 메일이 오다가 끊기면 거의 이것이다.**

- 즉시 확인: **Authentication** → **Logs** (Auth Logs) 에서
  `over_email_send_rate_limit` 또는 발송 실패 기록을 찾는다
- 임시 대응: 한 시간 기다린다
- **제대로 된 해결: §4.4 커스텀 SMTP 연결.** 개발 단계에서도 곧 필요해진다.
  Resend 무료 티어로도 하루 수백 통이 가능하다

#### ② 이미 가입된 이메일

같은 주소로 다시 가입을 시도하면 Supabase 는 **오류를 내지 않고 메일도 보내지
않는다** — 계정 존재 여부를 노출하지 않으려는 설계다.

앱이 이 경우를 감지해 `이미 가입된 이메일입니다` 라고 알려주므로, 그 메시지가
보이면 가입이 아니라 **로그인** 또는 **비밀번호 재설정**을 쓰면 된다.

인증만 안 끝낸 상태라면 가입 화면 하단의 **`메일이 오지 않았나요?`** →
**인증 메일 다시 받기** 를 쓴다.

#### ③ 이메일 템플릿 문법 오류

§4.6 에서 템플릿을 고친 뒤 안 오기 시작했다면 이쪽이다. Go 템플릿 문법이
깨지면 발송 자체가 실패한다.

- `{{ .TokenHash }}` 의 중괄호 두 개, 점, 공백을 그대로 유지했는지 확인
- **Authentication** → **Logs** 에 템플릿 관련 오류가 남는다
- 확실하지 않으면 템플릿을 기본값으로 되돌린 뒤 (**Reset to default**) 다시
  고친다

#### ④ 스팸 처리

내장 메일러는 발신 도메인 인증이 없어 스팸으로 분류되기 쉽다. 스팸함·프로모션함을
확인한다. 이것도 §4.4 커스텀 SMTP 로 해결된다.

---

#### 메일 없이 계정을 활성화하는 방법 (개발용)

메일 문제를 우회해 나머지 기능을 테스트하려면, 대시보드에서 직접 인증
처리하면 된다. **`Confirm email` 설정을 끄지 말 것** — 그건 보안 설정이다.

1. **Authentication** → **Users**
2. 해당 사용자 행을 클릭
3. 이메일 인증을 완료 처리 (`Confirm email` / `Verify` 동작)

이후 앱에서 정상 로그인된다.


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
| 메일이 오다가 갑자기 안 온다 | **내장 메일러 발송 한도 초과가 대부분.** §4.7 ① |
| 가입해도 메일이 안 온다 | 이미 가입된 이메일일 수 있다 (Supabase 가 재발송하지 않는다). §4.7 ② |
| 템플릿 수정 후 메일이 끊겼다 | 템플릿 문법 오류. §4.7 ③ |
| 메일 링크를 누르면 `error=auth_callback` 으로 튄다 | **대부분 §4.6 이메일 템플릿 미변경.** 주소창의 `reason` 값으로 원인을 구분한다 |
| 메일 링크가 `reason=no_token` | §4.6 템플릿을 `{{ .TokenHash }}` 형태로 바꾸지 않았다 |
| 글 작성 시 `권한이 없습니다` | 이메일 인증 미완료, 또는 공지 카테고리에 일반 계정으로 작성 시도 |
| 로그인이 자꾸 풀린다 | `proxy.ts` 가 동작하지 않는 상태. 빌드 출력에 `ƒ Proxy (Middleware)` 가 있는지 확인 |
| `Invalid API key` | Secret 키를 넣었거나 키 값이 잘린 상태. §3-② 로 다시 복사 |
| SQL 실행 시 `already exists` | 이미 적용된 것. §2.1 로 확인만 하면 된다 |

## 배포 전 남은 것

이 문서는 연결까지만 다룬다. 실사용 오픈 전에는
[TECH_SPEC.md §10](TECH_SPEC.md) 전체를 통과해야 한다. 특히 아직 안 된 것:

- 커스텀 SMTP (§4.4)
- 이메일 템플릿 한글화 — §4.6 의 링크 형태를 유지할 것
- CAPTCHA + rate limit (§4.5) — **코드 수정 동반**
- 유출 비밀번호 차단 (§4.2) — **Pro 플랜 필요**
- 도배 방지 쿨다운
- 자체 도메인 + HTTPS, Site URL·Redirect URLs 갱신
- DB 백업 활성화 및 **복구 절차 1회 리허설**
- 오류 추적(Sentry) 연결
- 개인정보 보관·파기 정책 확정
- §10.9 트랙 분리·규제 표기 점검
- **법적 고지문 변호사 검토** (PRD 부록 A)
