# 인수인계 — Phase 1 v1.0

> 세션이 길어져 새 대화로 옮길 때 쓰는 문서다. **새 세션은 이 문서부터
> 읽는다.** 나머지 문서는 필요할 때 펼친다 (§6 문서 지도).
>
> 기준 시점: **2026-09-09**, 태그 `phase1-v1.0` (보안검증 완료분 포함)

---

## 1. 새 세션 시작하는 법

새 대화 첫 메시지로 이거 하나만 주면 된다.

```
C:\Aiffel_Work\Main_Project 이어서 작업할게. HANDOFF.md 읽고 시작해.
```

읽는 순서: `HANDOFF.md` → `PHASES.md`(P1-D 남은 칸) → 필요하면 `DESIGN.md`.

---

## 2. 지금 상태

| | |
|---|---|
| 서비스 | 영웅호걸닷컴 (가칭) — 투자정보 공유 커뮤니티 |
| 배포 | https://namjosunhero.vercel.app (색인 차단 중) |
| 저장소 | `wilstein91/main_project_prototype`, `main` 브랜치 |
| 스택 | Next.js **16** + TypeScript + Tailwind 4 + Supabase + Vercel |
| DB | Supabase 프로젝트 ref `suoaovdanimacisbocuk`, 마이그레이션 0001~0005 |
| 로컬 개발 | `.claude/launch.json` 의 `heroes` (포트 **3200**) |
| 검사 | 타입·린트·빌드 통과, 단위 **121개** 통과, RLS 통합 **36/37** (1건은 §3.1 미적용 SQL 때문) |
| 콘텐츠 | 시드 글 26건 · 댓글 48개 · 시드 계정 7개 (오픈 전 삭제 — FINAL_CHECKLIST D-3) |

**Phase 1 v1.0 이 무엇인가**: 기능은 전부 완료·검증됐고, 디자인 기반
작업(P1-D)까지 대부분 끝난 상태. 여백·문안·접근성 세 칸이 남았다.

---

## 3. 먼저 할 일 (순서대로)

### 3.1 ⚠️ 사용자가 아직 안 돌린 SQL — 이게 첫 번째다

`supabase/migrations/0005_soft_delete_post.sql` 과
`supabase/dev_seed_views.sql` 이 **파일로는 있지만 DB 에 적용되지
않았다.** 이걸 돌리기 전까지:

- 회원이 자기 글을 삭제할 수 없다 (실제 버그, 원인은 §5.1)
- 목록에 테스트 글이 **10건** 남아 있다 (id 16·19·20·22·25·26·54·57·58·59).
  RLS 테스트를 돌릴 때마다 늘어난다 — 정리가 이 함수를 쓰기 때문이다
- 시드 글 조회수가 한 자리로 보인다

사용자에게 안내할 것 — SQL 에디터는 이 주소로 바로 열린다:

```
https://supabase.com/dashboard/project/suoaovdanimacisbocuk/sql/new
```

두 파일 내용을 붙여넣고 Run. 확인 방법: 마지막 표에서
`anon 실행권한 = false`, `회원 실행권한 = true`.

### 3.2 SQL 이 적용된 뒤 (내가 할 일)

1. 남은 테스트 글 10건 정리 — `soft_delete_post` RPC 로 (테스터 토큰 필요)
2. RLS 통합 테스트 재실행 — 삭제 경로 검증 3개가 새로 들어갔다
   ```bash
   npx vitest run --config vitest.rls.config.ts
   ```
3. 목록 화면에서 조회수 자릿수 확인 (숫자 열 정렬이 실제로 맞는지)

### 3.3 P1-D 남은 세 칸

| | 내용 |
|---|---|
| 여백 리듬 | 글 상세·폼 화면. 목록은 끝났다 |
| 문안 톤 | 빈 상태·오류 메시지 통일 (DESIGN.md §2) |
| 접근성 | 대비 4.5:1, 터치 44px, 키보드 탐색 |

### 3.4 Phase 1 완료로 치기 전 남은 것

- **커스텀 SMTP** — 없어서 비밀번호 재설정이 실제로 안 된다 (P2-F 로 미뤄둠)
- `supabase gen types` 로 `src/types/database.ts` 자동 생성 전환
  (지금은 손으로 관리 — 함수 추가할 때 여기도 고쳐야 한다)
- 실기기 QA (iOS·Android)

---

## 보안검증 결과 (2026-09-09) — 취약점 3건 수정

Phase 1 v1.0 마감 전에 프로덕션을 직접 찔러 점검했다. **셋 다 화면으로는
아무 증상이 없었다.**

| 발견 | 심각도 | 상태 |
|---|---|---|
| 오픈 리다이렉트 `?redirect=/..//evil.com` | 높음 (피싱) | 수정·테스트 고정 |
| 세션 쿠키가 `httpOnly` 아님 → 토큰 탈취 | 높음 (XSS 시 계정 탈취) | 수정·회귀 테스트 |
| 보안 헤더 HSTS 하나뿐 | 중간 (클릭재킹 등) | 수정 |

자세한 원인과 판단은 §5.9·§5.10 에 있다. 통과한 항목:

- RLS 36/37 — anon 글쓰기·카테고리 수정·감사로그 열람 차단, 회원의 공지
  작성·고정·타인 글 수정·권한 상승 전부 차단
- 브라우저 번들에 Supabase 키·주소 없음, `localStorage` 에 토큰 없음
- 비로그인 `/write` `/admin` `/settings` → `/login?redirect=` 로 307
- `/advisory` 404, `/company` 준비 중 게이트, `robots.txt` 전면 차단 + `noindex`
- 리다이렉트를 **쓰는 지점에서 다시 검증**한다 (폼 값을 신뢰하지 않는다)
- 오류 메시지에 DB 구조·SQL 이 노출되지 않는다

받아들인 절충 (FINAL_CHECKLIST §C-8 참고):

- **CSP `script-src` 미적용** — Next 의 인라인 하이드레이션 스크립트 때문에
  nonce 배선이 필요하다. 잘못 넣으면 화면이 아예 안 뜨므로 Phase 2 로 미뤘다.
  대신 `frame-ancestors` `form-action` `base-uri` `object-src` 는 켰다
  (스크립트 로딩과 무관해 앱 동작이 바뀌지 않는다)
- 이메일 인증 꺼짐 → 무제한 가입 가능. 오픈 전 필수 (D-1)
- 유출 비밀번호 차단·CAPTCHA 는 Supabase Pro 필요

---

## 4. 사용자와의 작업 방식 (중요)

`~/.claude/CLAUDE.md` 에 있는 내용이지만, 이번 세션에서 실제로 지적받은
것들을 덧붙인다.

1. **사용자는 vibe coding 입문자다.** 전문 용어는 그 자리에서 한 문장으로
   풀어준다. 순서는 왜 → 무엇 → 어떻게.
2. **파일 경로만 알려주지 말고 내용을 인라인으로 붙여준다.** "이 파일에
   넣으세요" 는 통하지 않는다. 붙여넣을 SQL·명령어는 코드블록으로.
3. **선택지를 늘어놓지 말고 추천안 하나.** 이유는 한두 줄.
4. **내가 할 수 있는 일을 사용자에게 시키지 않는다.** 키값·설정값도
   내가 넣는다. 사용자가 꼭 해야 하는 것(대시보드 클릭, SQL 실행)만 넘긴다.
5. **외부 서비스 UI 경로는 안내 전에 검증한다.** Supabase·Vercel 메뉴는
   자주 바뀐다. 기억으로 쓰면 "그런 메뉴 없다" 는 답이 돌아온다.
6. **한 번에 한 단계씩**, 번호를 매겨서, 각 단계에 "제대로 됐는지 확인하는
   방법" 한 줄.
7. 진행 상황을 부풀리지 않는다. 이번 세션에서 "화면이 있으니 완료" 로
   세다가 누락 4건을 놓쳤고, 지적받았다.

---

## 5. 이번 세션에 겪은 함정 (다시 겪지 말 것)

### 5.1 PostgREST 의 RETURNING 이 SELECT 정책에 걸린다 ★

**증상**: 회원이 자기 글 삭제(`is_deleted = true` UPDATE) → 42501.
같은 행의 `title` UPDATE 는 200. 정책에는 걸릴 조건이 없다.

**원인**: PostgREST 는 영향 행 수를 세려고 모든 쓰기를 `RETURNING` 이
달린 CTE 로 실행한다 (`Prefer: return=minimal` 이어도 마찬가지).
PostgreSQL 은 RETURNING 이 붙은 UPDATE 의 **결과 행에 SELECT 정책까지**
적용한다. `posts_select` 는 `is_deleted = false` 라서, 방금 삭제된 행은
작성자 본인에게도 안 보인다 → 위반.

**대조군**: `comments_select` 는 `using (true)` 라 같은 소프트 삭제가
204 로 성공한다. 차이는 SELECT 정책뿐이다.

**해법**: 읽기 정책을 넓히지 말고 삭제만 SECURITY DEFINER 함수로
(`soft_delete_post`, 0005). 권한 검사는 함수 안에서 하고, 비로그인 시
`v_author = auth.uid()` 가 NULL 이 되는 함정을 `coalesce` 로 막는다.

> 소프트 삭제를 다른 테이블에 추가하면 같은 문제가 재발한다.

### 5.2 막히는 것만 테스트하면 거짓 통과가 생긴다 ★

`남의 글을 삭제할 수 없다` 는 계속 **통과**하고 있었다. 실제로는 본인
글까지 포함해 모든 삭제가 막혀 있었기 때문이다. 통해야 하는 동작도 같은
강도로 검사한다. 지금은 `자기 글을 삭제할 수 있다` 가 들어가 있다.

또 테스트의 `afterAll` 정리가 조용히 실패하면서 운영 DB 에 테스트 글이
쌓였다. 정리 실패는 훅에서 깨지게 바꿨다.

### 5.3 RLS 로는 "이 컬럼은 바꾸지 마" 를 표현할 수 없다

UPDATE 정책의 `WITH CHECK` 는 NEW 값만 본다. 회원이 자기 `role` 을
`admin` 으로 바꾸는 걸 정책으로 막을 수 없었다. **컬럼 단위 GRANT** 가
정답 (0004: `revoke update on profiles` 후 필요한 컬럼만 `grant update (...)`).

### 5.4 로고를 벡터로 그릴 때

- 초승달을 **베지에로 흉내내면 렌즈**가 되고, 렌즈는 잎사귀로 읽힌다.
  네 번 다시 그리면서 매번 걸렸다. SVG `A`(arc) 두 개로 그리면 기하가
  보장된다 (DESIGN.md §3.4).
- `rotate()` 는 도형을 viewBox 밖으로 밀어 **날 끝을 자른다.** 기울기는
  좌표에 직접 넣는다.
- 20px 에서 형태로 구별되는 특징은 서너 개가 한계. **색은 형태보다 작아져도
  살아남는다** — 금 투겁·붉은 술을 넣고 나서야 잎사귀와 갈렸다.
- 워드마크는 서체가 아니라 **윤곽선**이다. 글자를 코드에서 못 고친다.
  이름이 바뀌면 `python scripts/build_logo.py 새이름`.

### 5.5 목록 디자인은 시드 없이 판단할 수 없다

글 1건으로는 행 간격도, 제목 줄바꿈도, 숫자 자리도 안 보인다. 시드 26건을
넣은 **뒤에야** 가운뎃점 메타 줄이 시끄럽다는 게 보였다. 디자인 작업
순서는 시드 → 판단 → 수정.

### 5.6 환경 함정 (Windows)

| 증상 | 원인·해법 |
|---|---|
| Python 이 쓴 JSON 을 utf-8 로 못 읽음 | Windows Python 기본 인코딩이 cp949. `open(..., encoding="utf-8")` 를 **쓸 때도** 명시 |
| `print()` 에서 `UnicodeEncodeError` | `export PYTHONIOENCODING=utf-8` |
| Python 이 `/tmp/x` 를 못 찾음 | Git Bash 의 `/tmp` ≠ Windows Python 의 `/tmp`(=`C:\tmp`). 절대 Windows 경로를 쓴다 |
| 긴 heredoc 이 `unexpected EOF` | 큰 파일은 Write 도구로 |

### 5.7 브라우저 미리보기 함정

- `computer.zoom` 의 영역 잘라내기가 동작하지 않는다 (전체 스크린샷이 온다).
- 콘솔 메시지는 페이지를 옮겨도 **과거 로그가 남는다.** 빌드 오류를
  판단할 때는 `npm run build` 로 확인한다.
- 넓은 뷰포트를 에뮬레이션하면 스크린샷이 심하게 축소돼 판단이 안 된다.
  구조 검증은 `read_page` 나 `javascript_tool` 로 좌표를 재는 편이 정확하다.
- 프로젝트 밖 `file://` 은 스크립트가 안 돈다. 확인용 HTML 은
  `public/_x.html` 로 두고 `localhost:3200/_x.html` 로 본다. **끝나면 지운다.**

### 5.8 Vercel · Supabase (앞 세션에서 겪은 것, 여전히 유효)

- Vercel 환경변수에 `NEXT_PUBLIC_` 접두사를 쓰면 저장이 막힌다. 이 앱은
  브라우저에서 Supabase 를 직접 쓰지 않으므로 접두사 없이
  `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `SITE_URL` / `ALLOW_INDEXING`.
  변수 타입은 **Config**(Secret 아님).
- Framework Preset 이 `Other` 로 잡히면 `next build` 를 안 돌리고
  `public/` 만 올려 전부 404 인데 "Ready" 로 표시된다.
- Supabase 키 체계 변경: `sb_publishable_...` / `sb_secret_...`.
- SQL 로 `auth.users` 를 만들 때 토큰 컬럼 8개를 NULL 로 두면 로그인이
  500 난다. 반드시 `''`. 복구는 `supabase/repair_auth_user.sql`.

---

### 5.9 입력 검사만으로는 오픈 리다이렉트를 못 막는다 ★

`safeInternalPath` 는 입력을 세 번 걸렀다 — `/` 로 시작하는지, 역슬래시가
없는지, 제어문자가 없는지. 그런데 `/..//evil.com` 이 뚫렸다.

단일 슬래시로 시작하니 검사를 다 통과하고, 파싱해도 출신이 유지된다.
그런데 **URL 파서가 `/..` 를 지우면서 pathname 이 `//evil.com` 이 된다.**
이 값으로 이동하면 브라우저가 프로토콜 상대 주소로 읽어 외부로 나간다.

교훈: **파싱 전에는 안전해 보이고 파싱 후에 위험해지는 입력이 있다.**
마지막 관문은 결과 문자열이어야 한다. 지금은 출력도 `//`·`/\` 로 시작하는지
검사한다. 공격 19종을 `safe-path.redirect.test.ts` 에 고정했다.

### 5.10 Supabase 세션 쿠키는 기본이 httpOnly 가 아니다 ★

`document.cookie` 에서 access token 과 **refresh token 이 그대로 읽혔다.**
XSS 한 번으로 계정이 넘어가고, refresh token 은 새 access token 을 계속
받아내므로 피해가 오래 간다.

`@supabase/ssr` 기본 구성은 **브라우저의 Supabase 클라이언트도 같은 쿠키를
읽는다**고 가정한다. 이 앱에는 브라우저 클라이언트가 없으므로
(`createBrowserClient` 0곳) `lib/supabase/cookie-options.ts` 로 강제했다.

⚠️ **브라우저에서 Supabase 를 직접 부르기로 방향을 바꾸면 이 파일 때문에
로그인이 깨진다.** 그때는 지우기 전에 왜 걸었는지부터 읽을 것.

개발 중에는 `secure` 를 걸지 않는다 — `http://localhost` 에서 secure 쿠키는
브라우저가 버려서 로그인이 안 된다. 운영에서만 켠다.

---

## 6. 문서 지도

| 문서 | 언제 펼치나 |
|---|---|
| **HANDOFF.md** (이 문서) | 세션 시작할 때 |
| [PHASES.md](PHASES.md) | 다음에 뭘 할지 고를 때 |
| [WORK_UNITS.md](WORK_UNITS.md) | 티켓별 구현·검증 근거를 확인할 때 |
| [DESIGN.md](DESIGN.md) | 화면·로고·색을 만질 때 |
| [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) | 오픈 준비 / 보안 점검 |
| [PRD.md](PRD.md) | 요구사항·트랙 분리·법적 고지 근거 |
| [TECH_SPEC.md](TECH_SPEC.md) | 스키마·RLS·아키텍처 결정 |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | DB·인증 설정을 사용자에게 안내할 때 |
| [DEPLOY.md](DEPLOY.md) | 배포 문제 |

**Next.js 16 문서가 `node_modules/next/dist/docs/` 에 동봉돼 있다.**
API 를 기억으로 쓰지 말고 여기를 본다 — `middleware.ts` 가 아니라
`proxy.ts`, `params`·`cookies()` 는 완전 비동기다.

---

## 7. 검증 명령 모음

```bash
npx tsc --noEmit                              # 타입
npx eslint src tests                           # 린트
npx vitest run                                 # 단위 96개
npx vitest run --config vitest.rls.config.ts   # RLS 통합 (실DB, 테스터 계정 필요)
npm run build                                  # 프로덕션 빌드 (컴파일 오류 확정 확인)
python scripts/build_logo.py                   # 로고 재생성
```

미리보기는 `preview_start` 로 `heroes` 를 띄운다 (포트 3200).
Bash 로 개발 서버를 돌리지 않는다.

---

## 8. 이번 세션(Phase 1 v1.0)에서 한 일

| 커밋 | 내용 |
|---|---|
| `487057d` | Pretendard 자체 호스팅(92조각) · 청록 색 토큰 · 마크 v1~v3 |
| `bada712` | 목록 행 재구성 — 가운뎃점 제거, 오른쪽 숫자 고정 열 |
| `a6cd7d0` | **삭제 버그 수정** — 0005 함수 + 테스트 4개 추가 |
| `7cae016` | 마크 v4 + 삽화(BladeCrest) 4곳 + 앱 안쪽 404 분리 |
| `7eb66ad` | 가로형 로고 — 언월도 + 나눔명조 윤곽선 워드마크 |
| `861e7af` | 인수인계 문서(이 문서) |
| `392c34c` | **보안 취약점 3건 수정** — 오픈 리다이렉트·쿠키 노출·보안 헤더 |

바뀐 화면: 헤더(마크+명조 워드마크), 홈 상단 띠(비회원), `/about` 히어로,
404, 빈 목록, 글 목록 행.
