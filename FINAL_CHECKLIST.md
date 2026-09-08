# 최종 체크리스트 (오픈 전 관문)

**여기 전부 통과하지 않으면 실사용 오픈하지 않는다.**

단위 작업 현황은 [WORK_UNITS.md](WORK_UNITS.md), 설계 근거는
[TECH_SPEC.md §10](TECH_SPEC.md) 에 있다. 이 문서는 **기능이 다 만들어진
뒤에 하는 최종 점검**이다.

| 구획 | 내용 | 자동화 |
|---|---|---|
| **A** | 프로그램이 오작동 없이 도는가 | 부분 |
| **B** | 의도하지 않은 방식으로 접근해도 버티는가 | `npm run test:rls` |
| **C** | **보안** — 가장 꼼꼼히 볼 곳 | 부분 |
| **D** | 개발용으로 껐던 것을 되돌렸는가 | 수동 |
| **E** | 인프라·운영 | 수동 |
| **F** | 규제·표기 | 수동 |

> 기능은 MVP 수준이어도 된다. **C 는 MVP 기준이 없다** — 하나라도 비면
> 오픈하지 않는다.

---

## A. 오작동 없이 도는가

### A-1. 자동 검사

```bash
npm run test          # 단위
npm run test:rls      # 실 DB 통합
npx tsc --noEmit      # 타입
npm run lint          # 정적 분석
npm run build         # 프로덕션 빌드
```

- [ ] 5개 전부 통과 (경고 0건)
- [ ] `npm run build` 출력에 `ƒ Proxy (Middleware)` 가 있다 (없으면 세션 갱신이 안 된다)

### A-2. 핵심 흐름 (실제로 눌러본다)

- [ ] 가입 → 인증 메일 → 로그인 → 헤더에 닉네임 표시
- [ ] 글 작성 → 목록·상세에 반영
- [ ] 글 수정 → `수정됨` 표기
- [ ] 글 삭제 → 목록에서 사라지고 직접 접근 시 404
- [ ] 댓글 → 답글 → 댓글 수가 실제 수와 일치
- [ ] 답글에 답글 시도 → `대댓글은 1단계까지만`
- [ ] 댓글 수정 → 내용 교체 + `수정됨`
- [ ] 댓글 삭제 → `삭제된 댓글입니다` 자리 남고 **답글 유지**
- [ ] 닉네임 변경 → 30일 재변경 차단
- [ ] 비밀번호 변경 → 새 비밀번호로 로그인
- [ ] 로그아웃 → 보호 페이지 접근 시 로그인으로
- [ ] 회원 탈퇴 → 작성물이 `탈퇴한 사용자` 로 표기
- [ ] 관리자: 공지 작성 + 상단 고정 → 목록 최상단에 `공지` 배지
- [ ] 관리자: 타인 글 삭제 → `/admin` 감사 로그에 기록

### A-3. 화면

- [ ] PC(≥1024) 좌측 사이드바 / 모바일(<768) 하단 탭 4개
- [ ] **실기기** iOS Safari · Android Chrome (T-27)
- [ ] 빈 목록에 안내 문구 + 행동 버튼 (공백 아님)
- [ ] 긴 표·코드블록이 본문 밖으로 넘치지 않는다 (자체 스크롤)
- [ ] 콘솔 오류 0건 (새 탭 기준)

### A-4. 성능

- [ ] 글 목록 LCP 2초 이내 (모바일 3G)
- [ ] Lighthouse 접근성 90 이상

---

## B. 비정상 접근 대응

**대부분 `npm run test:rls` 의 `abuse.test.ts` 가 자동 확인한다.**
아래는 그 목록과, 자동화하지 못한 항목이다.

### B-1. 로그인 화면 (자동)

- [ ] 없는 아이디로 로그인 → `이메일 또는 비밀번호가 올바르지 않습니다` (500 아님)
- [ ] **없는 계정과 있는 계정의 응답이 동일** (계정 열거 방지)
- [ ] 비밀번호 없이 제출 → 400대, 500 아님
- [ ] 이메일 없이 제출 → 400대
- [ ] 빈 본문·잘못된 타입 → 500 아님

### B-2. 직접 URL 접근 (자동)

- [ ] 로그인 없이 즐겨찾기한 `/write` `/settings` `/admin` → `/login?redirect=` 로
- [ ] 로그인 후 원래 가려던 페이지로 복귀
- [ ] 없는 글 번호 `/c/free/999999` `0` `-1` → 404
- [ ] 글 번호에 문자·따옴표·SQL 조각 → 404 (`abc`, `%27`, `1 OR 1=1`)
- [ ] 없는 카테고리 → 404
- [ ] 경로 탐색(`..`, `%2e%2e`) → 500 아님, 내부 정보 노출 없음
- [ ] `?page=0` `-5` `abc` `99999` `page[]=1` → 200 (**500 이었던 버그 수정됨**)
- [ ] 존재하지 않는 경로 → 404

### B-3. 폼 조작 (자동)

- [ ] 일반 회원이 공지 게시판에 글쓰기 → `42501` 차단
- [ ] 일반 회원이 `is_pinned=true` 로 작성·수정 → `42501` 차단
- [ ] 타인 글·댓글·프로필 수정·삭제 → 0행
- [ ] UI 우회해 2단계 대댓글 → DB 트리거 차단

### B-4. 수동 확인

- [ ] 같은 폼을 빠르게 두 번 제출 → 중복 생성 안 됨 (`SubmitButton` 이 비활성)
- [ ] 글 작성 중 세션 만료 → 로그인으로 보내고, 로그인 후 안내
- [ ] 네트워크 끊고 제출 → 화면이 깨지지 않고 오류 표시
- [ ] 오류 화면에 스택 트레이스·`node_modules`·DB 주소 노출 없음 (자동 포함)

---

## C. 보안 ⚠️ 가장 중요

### C-1. 키 관리

- [ ] `.env.local` 이 `.gitignore` 에 포함되고 **git 이력 전체**에 없다
      ```bash
      git log --all --full-history -- .env.local     # 결과 없어야 함
      git grep -I "sb_secret_\|service_role" $(git rev-list --all) | grep -v "쓰지 않는다"
      ```
- [ ] **`service_role` / `sb_secret_` 키를 앱에서 쓰지 않는다** (설계 원칙)
- [ ] 키가 한 번이라도 커밋·공유·로그에 노출됐으면 **재발급**
- [ ] 브라우저로 전달되는 HTML·JS 에 키·DB 주소가 없다 (자동 검사 포함)
- [ ] Vercel 환경변수에 `NEXT_PUBLIC_` 접두사가 붙은 Supabase 값이 없다

### C-2. 접근 제어 (RLS)

- [ ] **모든 테이블에 RLS 활성화** — 신규 테이블 추가 시 마이그레이션에 필수
      ```sql
      select tablename, rowsecurity from pg_tables
       where schemaname='public' order by tablename;   -- 전부 true
      ```
- [ ] `npm run test:rls` 통과
- [ ] **일반 회원이 스스로 `admin` 이 될 수 없다** (0004 — 실제로 있었던 취약점)
      ```sql
      select grantee, column_name from information_schema.column_privileges
       where table_name='profiles' and privilege_type='UPDATE'
         and grantee in ('authenticated','anon');
      -- nickname / nickname_changed_at / status / updated_at 만. role 없어야 함
      ```
- [ ] `SECURITY DEFINER` 함수는 필요한 역할에만 `grant`, `public` 에서 `revoke`
- [ ] **Advisors → Security Advisor 경고 0건**
- [ ] Advisors → Performance Advisor 확인 (누락 인덱스)
- [ ] 새 테이블을 추가했다면 `tests/rls/policies.test.ts` 에 케이스 추가

### C-3. 입력 처리 · XSS

- [ ] 사용자 본문이 `rehype-sanitize` 를 통과한다 (`PostBody`)
- [ ] `dangerouslySetInnerHTML` 사용 0건
      ```bash
      grep -rn "dangerouslySetInnerHTML" src/    # 결과 없어야 함
      ```
- [ ] `PostBody.test.tsx` 통과 — `<script>` `<img onerror>` `<iframe>`
      `style` `javascript:` `data:` 전부 제거
- [ ] 외부 링크에 `rel="nofollow noopener noreferrer"` 강제
- [ ] 모든 입력을 **서버에서** zod 로 재검증 (클라이언트 검증은 UX용)
- [ ] 제목 100자 · 본문 20,000자 · 댓글 1,000자 제한이 DB 제약으로도 있다

### C-4. 리다이렉트 · CSRF

- [ ] `?redirect=` `?next=` 가 `safeInternalPath()` 를 통과한다
- [ ] `safe-path.test.ts` 통과 — `//evil.com` `/\evil.com` 제어문자 전부 차단
- [ ] 리다이렉트를 쓰는 모든 곳이 이 함수를 쓴다
      ```bash
      grep -rn "redirect(" src/lib/actions/ src/lib/auth/ | grep -v safeInternalPath
      ```
- [ ] 데이터 변경이 전부 Server Action 을 지난다 (Next 의 Origin 검증을 받는다)
- [ ] 클라이언트에서 DB 에 직접 write 하지 않는다

### C-5. 인증

- [ ] **Confirm email 활성화** (D-1 참고 — 지금 꺼져 있다)
- [ ] 최소 비밀번호 10자 + 문자 조합
- [ ] **유출 비밀번호 차단(HaveIBeenPwned)** — Pro 플랜 필요
- [ ] **CAPTCHA** (Attack Protection) — 클라이언트 코드 수정 동반
- [ ] Rate Limits 확인 (가입·로그인·메일 발송)
- [ ] 비밀번호 재설정 응답이 계정 존재 여부를 노출하지 않는다
- [ ] 비밀번호를 직접 저장하지 않는다 (Supabase Auth 위임)
- [ ] 세션 쿠키가 `httpOnly` · `secure` · `sameSite` 로 설정된다
- [ ] `proxy.ts` 가 세션을 갱신한다 (빌드 출력 확인)
- [ ] `/admin` 이 **proxy + 서버 컴포넌트 이중 확인** 을 한다

### C-6. 권한 경계 (수동 — 두 계정으로)

- [ ] 일반 회원으로 `/admin` 접근 → 404 (존재를 알리지 않는다)
- [ ] 일반 회원이 타인 글의 수정 링크로 직접 접근 → 404
- [ ] 관리자가 타인 글을 볼 때 **삭제만 있고 수정은 없다**
- [ ] 관리자의 타인 글 삭제가 `audit_logs` 에 남는다
- [ ] 관리자 본인 글 삭제는 감사 로그에 남지 않는다 (의도)

### C-7. 정보 노출

- [ ] 삭제된 글이 anon·일반 회원 모두에게 안 보인다
- [ ] `audit_logs` 를 관리자 외에는 못 읽는다
- [ ] 오류 메시지에 DB 구조·SQL·내부 경로가 없다 (`fromSupabase` 가 변환)
- [ ] 미분류 오류는 서버 로그에만 남고 사용자에게는 일반 문구를 준다
- [ ] `hidden` 게이트 경로가 404 다 (콘텐츠가 새지 않는다)

### C-8. 알려진 절충 (오픈 전 판단 필요)

기능을 위해 받아들인 위험이다. **그대로 갈지 막을지 결정하고 체크한다.**

| # | 내용 | 위험 | 선택 |
|---|---|---|---|
| 1 | 가입 시 `이미 가입된 이메일입니다` 안내 | 이메일 열거 가능 | [ ] 유지 / [ ] 문구를 모호하게 |
| 2 | `profiles` 읽기 공개 (닉네임·**role**) | 관리자 닉네임 노출 | [ ] 유지 / [ ] 뷰로 role 숨김 |
| 3 | `is_nickname_available` 을 anon 에 허용 | 닉네임 열거 | [ ] 유지 (닉네임은 공개 정보) |
| 4 | `increment_view_count` 를 anon 에 허용 | 조회수 부풀리기 | [ ] 유지 / [ ] rate limit |
| 5 | 원시 HTML 이 있는 줄이 통째로 사라진다 | UX (보안은 안전) | [ ] 유지 / [ ] 이스케이프 표시 |
| 6 | 저장소 Public | 스키마·정책 공개 | [ ] 유지 / [ ] Private 전환 |

---

## D. 개발용으로 껐던 것 되돌리기

### D-1. 이메일 인증 ⚠️ 현재 꺼짐

| | |
|---|---|
| 왜 껐나 | 개발 중 가입을 즉시 하려고 |
| 오픈 시 위험 | **남의 이메일 주소로 무제한 가입.** 없는 주소로도 계정 생성 |
| 되돌리는 곳 | `dashboard/project/_/auth/providers?provider=Email` → **Confirm email** |

> **앱이 알려준다.** 꺼져 있는 동안 상단에 노란 `개발 모드` 배너가 뜬다.
> 켜면 자동으로 사라진다. **배너를 코드에서 지우지 말 것** — 지우면
> 정작 필요한 순간에 경고가 없어진다.

- [ ] Confirm email 켜기
- [ ] `개발 모드` 배너 사라진 것 확인
- [ ] 인증 없이 만든 개발용 계정 정리

### D-2. 검색엔진 색인 ⚠️ 현재 차단

- [ ] 법적 고지문 변호사 검토 완료 (**이게 먼저다**)
- [ ] 사업자 정보 확정 (`config/company.ts`)
- [ ] Vercel 환경변수 `ALLOW_INDEXING=true` 추가 후 재배포
- [ ] `/robots.txt` 가 `Disallow: /` 가 아니다
- [ ] 홈 소스에 `noindex` 가 없다

### D-3. 개발용 계정·코드 정리

시드 계정 7개가 실제 DB 에 있다. 전부 `@namjosunhero.local` 이라 실제
메일이 가지 않는 주소이고, 목록 디자인을 판단할 재료로 만든 것이다.

| 계정 | 닉네임 | 비밀번호 | 용도 |
|---|---|---|---|
| `tester@namjosunhero.local` | 테스트회원 | `TestMember-2026!` | RLS 통합 테스트가 로그인해서 쓴다 |
| `seed.kangnam@…` | 강남불패 | `SeedMember-2026!` | 시드 글 작성자 |
| `seed.jonber@…` | 존버중입니다 | 〃 | 〃 |
| `seed.semicon@…` | 반도체구경꾼 | 〃 | 〃 |
| `seed.dividend@…` | 배당모으기 | 〃 | 〃 |
| `seed.newbie@…` | 이제막시작 | 〃 | 〃 |
| `seed.chart@…` | 차트만보는사람 | 〃 | 〃 |

`tester` 를 지우면 RLS 통합 테스트가 건너뛰어진다 (`hasMember` 가
false). **지우는 순서는 테스트를 마지막으로 돌린 뒤**다.

- [ ] 시드 글 26건 + 댓글 삭제 (제목이 투자 주제인 글들)
- [ ] 시드 계정 6개 삭제
- [ ] 테스트 회원 삭제 — `supabase/drop_test_member.sql` (테스트 마지막 실행 후)
- [ ] `supabase/dev_seed_views.sql` 로 넣은 조회수는 글과 함께 사라진다
- [ ] 검증용 글·댓글 삭제
- [ ] 시드 코드 제거 (`SUPABASE_SETUP.md` §8)
      ```bash
      grep -rn "isSeedMode\|PendingNotice\|data/seed" src/    # 결과 없어야 함
      ```
- [ ] `create_admin.sql` 로 만든 관리자 비밀번호를 강한 값으로 변경
- [ ] `.env.local` 의 `TEST_MEMBER_*` 제거 (또는 CI 전용으로 분리)
- [ ] `supabase gen types` 로 `types/database.ts` 재생성

---

## E. 인프라 · 운영

- [ ] **커스텀 SMTP** — 내장 메일러는 시간당 몇 통. 없으면 비밀번호 재설정 불가
- [ ] 발신 도메인 SPF · DKIM · DMARC
- [ ] 이메일 템플릿이 `{{ .TokenHash }}` 형태 (`SUPABASE_SETUP.md` §4.6)
- [ ] 자체 도메인 + HTTPS
- [ ] Supabase `Site URL` · `Redirect URLs` 를 실제 도메인으로 (와일드카드 금지)
- [ ] Vercel `SITE_URL` 갱신 후 재배포
- [ ] **Vercel Hobby → Pro** (유료화·광고 시점. Hobby 는 상업적 사용 제한)
- [ ] Supabase Free → Pro (미사용 시 일시 정지, 용량·발송 한도)
- [ ] DB 자동 백업 + **복구 절차 1회 리허설**
- [ ] 오류 추적(Sentry) 연결
- [ ] 장애 시 연락 체계·점검 페이지

## F. 규제 · 표기

- [ ] **법적 고지문 변호사 검토** (PRD 부록 A 3종)
- [ ] 커뮤니티 트랙 불변조건 I-1~I-4 유지
      (운영자 투자의견 없음 / 투자정보 대가 없음 / 종목추천·매매신호 없음 / 수익률 표방 없음)
- [ ] 금지 기능 부재 — `npm run test` 의 `features.test.ts` 가 확인
- [ ] **더미 사업자등록번호·주소·전화번호 없음**
- [ ] 서비스명 상표 확인 (KIPO)
- [ ] 관리자 운영 수칙 문서화 (PRD D-5)
- [ ] 전 페이지 푸터 고지 + 글 상세 작성자 책임 고지
- [ ] 가입 약관에 투자 유의 고지 필수 동의 포함
- [ ] 인허가 전이면 `/advisory` `/research` 가 404

---

## 오픈 직전 10분 점검

| # | 확인 | 기대 |
|---|---|---|
| 1 | 상단 `개발 모드` 배너 | 없다 |
| 2 | 새 이메일로 가입 | 인증 메일 수신, 링크 전 로그인 불가 |
| 3 | 비밀번호 재설정 | 메일 수신 → 재설정 완료 |
| 4 | `/robots.txt` | `Disallow: /` 아니다 |
| 5 | 푸터 사업자 정보 | `설립 절차 진행 중` 아니다 |
| 6 | `npm run test && npm run test:rls` | 전부 통과 |
| 7 | Security Advisor | 경고 0건 |
| 8 | `/advisory` | 인허가 전이면 404 |
| 9 | 로그아웃 상태로 `/admin` | `/login` 으로 |
| 10 | 일반 회원으로 `/admin` | 404 |
