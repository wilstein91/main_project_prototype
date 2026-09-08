# 배포 절차 (Vercel)

저장소: https://github.com/wilstein91/main_project_prototype (main 브랜치)

Vercel 계정 생성과 로그인은 직접 하셔야 한다. 그 외에 필요한 값은 아래에
전부 적어 두었다.

---

## 1. Vercel 계정 만들고 저장소 연결

1. https://vercel.com 접속 → **Continue with GitHub** 로 가입
   (GitHub 계정으로 가입하면 저장소 연결이 자동으로 된다)
2. 가입 후 **Add New… → Project**
3. 목록에서 **`main_project_prototype`** 을 찾아 **Import**
   - 안 보이면 **Adjust GitHub App Permissions** 로 저장소 접근을 허용한다
4. 설정 화면에서 **아무것도 바꾸지 않는다**
   - Framework Preset: `Next.js` (자동 인식)
   - Build Command / Output Directory: 비워 둔다 (자동)
   - Root Directory: 비워 둔다 (저장소 루트가 프로젝트 루트다)

## 2. 환경변수 3개 입력 (Deploy 누르기 전에)

같은 화면의 **Environment Variables** 를 펼치고 아래를 넣는다.
`.env.local` 에 있는 값과 같다.

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://suoaovdanimacisbocuk.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_BvN91QIv_SDfhIbLPhk8Pw_8no04U9f` |
| `SITE_URL` | **1차 배포 후에 넣는다** (§4 참고) |

> `SITE_URL` 은 배포 주소가 정해진 뒤에야 알 수 있다. 지금은
> 비워 두면 된다 — 코드가 Vercel 이 주는 주소를 자동으로 읽는다
> (`lib/site.ts`). §4 에서 정확한 값으로 고정한다.
>
> **secret 키(`sb_secret_...`)는 넣지 않는다.** 이 프로젝트는 쓰지 않는다.
>
> **`NEXT_PUBLIC_` 접두사를 붙이지 않는다.** 붙이면 Vercel 이
> "값이 브라우저에 노출된다"며 저장을 막는다. 이 값들은 서버에서만
> 읽히므로 접두사가 필요 없다.

## 3. Deploy

**Deploy** 를 누르면 2~3분 뒤 주소가 나온다.

```
https://namjosunhero.vercel.app
```

(정확한 주소는 Vercel 이 알려준다. 프로젝트명에 따라 조금 다를 수 있다)

이 시점에 **읽기는 동작한다** — 홈·게시판·글 상세·정책 페이지.
**로그인은 아직 안 된다.** §4 를 해야 한다.

## 4. Supabase 에 배포 주소 등록 (필수)

이걸 안 하면 로그인·가입이 전부 실패한다. 인증이 돌아올 주소를
Supabase 가 모르기 때문이다.

### 4-1. Vercel 환경변수 고정

Vercel 프로젝트 → **Settings → Environment Variables** 에서 추가/수정:

| Name | Value |
|---|---|
| `SITE_URL` | `https://<배포주소>` (끝에 `/` 없이) |

저장 후 **Deployments → 최신 배포 → ⋯ → Redeploy**.
환경변수는 빌드 시점에 박히므로 **재배포해야 반영된다.**

### 4-2. Supabase URL 설정

→ [Supabase 인증 URL 설정 열기](https://supabase.com/dashboard/project/suoaovdanimacisbocuk/auth/url-configuration)

- **Site URL**: `https://<배포주소>`
- **Redirect URLs** 에 **두 개 추가** (기존 localhost 항목은 그대로 둔다)
  - `https://<배포주소>/auth/confirm`
  - `https://<배포주소>/auth/callback`

**Save**.

## 5. 확인

| # | 확인 | 기대 |
|---|---|---|
| 1 | 배포 주소 접속 | 홈이 뜨고 `아직 글이 없습니다` |
| 2 | `/c/free` | 카테고리 설명이 보임 (DB 연결됨) |
| 3 | `/company` | `준비 중` 안내 |
| 4 | `/advisory` | 404 |
| 5 | `/robots.txt` | `Disallow: /` (색인 차단 중) |
| 6 | `/write` | `/login?redirect=/write` 로 이동 |
| 7 | 관리자 계정으로 로그인 | 헤더에 닉네임과 `관리자` 표시 |

7번이 실패하면 §4 를 다시 확인한다 (주소 불일치가 대부분이다).

---

## 알아둘 것

### 무료(Hobby) 플랜은 상업적 사용이 제한된다

Vercel Hobby 플랜은 **비상업적 용도로만** 허용된다. 지금은 무료 커뮤니티라
문제되지 않지만, **유료 구독이나 광고를 붙이는 시점에는 Pro 로 전환해야
한다.** Phase 4 착수 전 확인 항목이다 (TECH_SPEC §10.8).

### 검색엔진에는 아직 안 올라간다

의도한 것이다. 변호사 검토 전 법적 고지문과 미확정 사업자 정보가 색인되면
지워도 캐시에 남는다. 정식 오픈 시점에 Vercel 환경변수로
`ALLOW_INDEXING=true` 를 추가하고 재배포하면 열린다.
코드 수정은 필요 없다.

### 저장소가 Public 이다

스키마·RLS 정책·법적 초안이 누구나 볼 수 있다. 공개 키와 프로젝트 ref 는
어차피 배포된 JS 번들에 들어가므로 저장소 공개로 새로 노출되는 비밀은 없다.
**단, 접근 통제는 전적으로 RLS 에 달려 있다** — anon 쓰기가 막히는지
검증했고(§7 of SUPABASE_SETUP.md), 새 테이블을 추가할 때마다 같은 검증이
필요하다.

실제 사업자 정보를 넣는 시점에는 저장소를 Private 으로 바꾸는 것을 검토한다.

### 이후 배포는 자동이다

`main` 에 푸시하면 Vercel 이 자동으로 다시 배포한다. 별도 명령이 없다.
