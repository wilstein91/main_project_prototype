# 단위 작업 현황

**이 문서가 진행 상황을 보는 곳이다.** 티켓의 원본 정의는
[TECH_SPEC.md §11](TECH_SPEC.md) 에 있고, 여기서는 상태만 관리한다.

| 문서 | 용도 |
|---|---|
| [PRD.md](PRD.md) | 무엇을 만드는가 (요구사항 F-101~F-505, 트랙 분리) |
| [TECH_SPEC.md](TECH_SPEC.md) | 어떻게 만드는가 (스키마·RLS·티켓 정의) |
| [PHASES.md](PHASES.md) | 페이즈별 할 일 (Phase 0~5 체크리스트) |
| [DESIGN.md](DESIGN.md) | 디자인 방향 (로고·색·타이포·톤) |
| **WORK_UNITS.md** | **지금 어디까지 왔는가** ← 이 문서 |
| [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) | 오픈 전 최종 점검 (기능·비정상 접근·보안) |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | DB 연결 절차 |
| [DEPLOY.md](DEPLOY.md) | 배포 절차 |

최종 갱신: 2026-09-08 · 배포 주소: https://namjosunhero.vercel.app (색인 차단 중)

---

## 요약

| Phase | 상태 |
|---|---|
| Phase 0 — 기반 | ✅ 완료 |
| **Phase 1 — MVP** | ✅ **기능 완료. 프로덕션 검증 완료** |
| Phase 2~5 | ⬜ 미착수 |

**남은 것은 기능이 아니다** — 메일 발송(SMTP), 시드 코드 제거, 폰트,
그리고 [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) 통과.

---

## Phase 0 — 기반

| 티켓 | 작업 | 상태 |
|---|---|---|
| T-01 | Next.js + TS + Tailwind 프로젝트, Git | ✅ |
| T-02 | Supabase 프로젝트, 환경변수 | ✅ |
| T-03 | 디자인 토큰 · UI 컴포넌트 | 🔶 Pretendard 폰트 self-host 잔여 |
| T-04 | 설정 중앙화 (`config/`) + 게이트 컴포넌트 | ✅ |
| T-05 | 레이아웃 셸 (헤더·사이드바·하단탭·푸터) | ✅ |
| T-06 | Vercel 배포 파이프라인 | ✅ |

## Phase 1 — MVP

| 티켓 | 작업 | 상태 | 검증 |
|---|---|---|---|
| T-07 | DB 마이그레이션 (스키마 + 시드 카테고리) | ✅ | `verify.sql` |
| T-08 | 트리거 · 함수 | ✅ | 프로필 자동 생성, 댓글 수 동기화 실측 |
| T-09 | RLS 정책 | ✅ | `npm run test:rls` |
| T-10 | Supabase 클라이언트 + `proxy.ts` 세션 갱신 | ✅ | 새로고침 후 로그인 유지 |
| T-11 | 회원가입 (약관 동의 · 닉네임 중복) | 🔶 코드 완료, **메일 발송 막힘** |
| T-12 | 로그인 / 로그아웃 / 비밀번호 재설정 | 🔶 로그인·로그아웃 ✅ / 재설정은 메일 필요 |
| T-13 | 카테고리 · 글 목록 · 페이지네이션 | ✅ | 범위 초과 페이지 처리까지 |
| T-14 | 글 작성 · 수정 · 삭제 | ✅ | 프로덕션 실측 |
| T-15 | 글 상세 · 조회수 | ✅ | 쿠키 중복 방지 (3회 방문 → 조회 1) |
| T-16 | 댓글 · 대댓글 1단계 · 수정 · 삭제 | ✅ | UI 우회해도 DB 트리거 차단 |
| T-17 | 홈 통합 피드 | ✅ | 공지 상단 고정 확인 |
| T-18 | 프로필 설정 (닉네임 · 비밀번호 · 탈퇴) | 🔶 코드 완료, 화면 미검증 |
| T-19 | 정책 페이지 3종 + 부록 A 문안 | ✅ | |
| T-20 | 서비스 소개 `/about` | ✅ | |
| T-21 | 자문사 트랙 게이트 (`/company` `/advisory`) | ✅ | 준비 중 / 404 확인 |
| T-22 | sitemap · robots 게이트 연동 | ✅ | 색인 차단 확인 |
| T-23 | 관리자 (강제 삭제 · 공지 작성 · 감사 로그) | 🔶 감사 로그 **화면 배포 대기** |
| T-24 | 오류/빈 상태/스켈레톤, 메타태그 | ✅ | |
| T-25 | §10 보안·운영 체크리스트 | ⬜ [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) 로 이동 |
| ~~T-26~~ | ~~전환 리허설~~ — **폐기 (PRD v0.4).** 자문사 트랙을 별도 웹사이트로 분리해 리허설할 게이트가 없다 | ✖ 해당 없음 |
| T-27 | 실기기 QA (iOS Safari / Android Chrome) | ⬜ 미실시 |

### 추가로 한 일 (티켓 밖)

| 작업 | 이유 |
|---|---|
| 마이그레이션 0002 (닉네임 자동 생성) | 닉네임 없이 만든 계정이 트리거 실패로 롤백됐다 |
| 마이그레이션 0003 (`is_pinned` 관리자 전용) | 화면에서 체크박스를 숨기는 것만으로는 폼 조작을 못 막는다 |
| **마이그레이션 0004 (권한 상승 차단)** | **회원이 스스로 `admin` 이 될 수 있었다** — 테스트가 발견 |
| `lib/safe-path.ts` | `/\evil.com` 이 리다이렉트 검증을 통과했다 (오픈 리다이렉트) |
| 색인 차단 (`ALLOW_INDEXING`) | 검토 전 법적 고지문이 색인되면 지워도 캐시에 남는다 |
| `DevAuthBanner` | 이메일 인증을 끈 상태를 앱이 스스로 알린다 |
| 테스트 도입 (vitest) | 손으로 확인하는 방식은 반복이 안 된다 |
| `create_admin` / `create_test_member` / `repair_auth_user` SQL | 메일 없이 계정을 만들고 권한을 검증하기 위해 |

## Phase 1 남은 것 · Phase 2 이후

**P1-D 베이스 디자인 개선**이 Phase 1 의 마지막 할 일이다.
항목과 이유는 [PHASES.md](PHASES.md), 판단 기준은 [DESIGN.md](DESIGN.md).

Phase 2~5 할 일 목록도 [PHASES.md](PHASES.md) 에 있다 (여기 중복하지 않는다).

---

## 테스트 현황

```bash
npm run test        # 단위 121개 — DB 불필요
npm run test:rls    # 통합 37개 — 실 DB 필요 (.env.local)
```

| 파일 | 검증 대상 |
|---|---|
| `src/lib/validations/schemas.test.ts` | 닉네임·비밀번호·약관·글·댓글 경계값 |
| `src/config/features.test.ts` | 트랙 분리, 게이트 3상태, 금지 기능 부재 |
| `src/components/post/PostBody.test.tsx` | **마크다운 sanitize** (XSS 차단) |
| `src/lib/safe-path.test.ts` | **오픈 리다이렉트 차단** |
| `src/lib/utils/date.test.ts` | KST 고정, 자정 경계 |
| `src/lib/profile-rules.test.ts` | 닉네임 30일 쿨다운 |
| `tests/rls/policies.test.ts` | **RLS 권한 경계** (anon / 일반회원) |
| `tests/rls/abuse.test.ts` | **비정상 접근 대응**, 키 노출 여부 |

**아직 없는 것**: E2E(Playwright), 관리자 권한 테스트(관리자 비밀번호가
필요해 자동화하지 않음 — 손으로 검증함)
