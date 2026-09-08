# 영웅호걸닷컴 (가칭)

투자정보 공유 커뮤니티 플랫폼. 개인 투자자들이 정보와 의견을 나누는 게시판 서비스다.

| 문서 | 용도 |
|---|---|
| [WORK_UNITS.md](WORK_UNITS.md) | **지금 어디까지 왔는가** ← 진행 상황은 여기 |
| [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) | **오픈 전 최종 관문** (기능·비정상 접근·보안) |
| [PRD.md](PRD.md) | 무엇을 만드는가 — 요구사항, 트랙 분리, 법적 고지문 |
| [TECH_SPEC.md](TECH_SPEC.md) | 어떻게 만드는가 — 아키텍처, 스키마·RLS, 티켓 정의 |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | DB 연결 절차 |
| [DEPLOY.md](DEPLOY.md) | 배포 절차 |

배포: https://namjosunhero.vercel.app (색인 차단 중)

## 현재 상태

**Phase 1 구현 완료. Supabase 프로젝트만 만들면 동작한다.**

인증·게시판 CRUD·댓글·권한 코드가 모두 작성되어 있고, 환경변수 유무로 두 모드가 갈린다.

| | 키 없음 (현재) | 키 있음 |
|---|---|---|
| 데이터 | `src/lib/data/seed.ts` 시드 | Supabase Postgres |
| 로그인 | 항상 비로그인 | 실제 세션 |
| 저장 | 비활성 + 안내 문구 | 동작 |

키를 넣는 것만으로 전환된다 — [SUPABASE_SETUP.md](SUPABASE_SETUP.md) 를 따라가면 된다.
화면에 `데이터베이스 미연결` 안내가 보이는 곳이 시드 모드다. 실서비스 배포 전에는 하나도 남아 있지 않아야 한다.

## 실행

```bash
npm install
npm run dev
```

기본 포트는 3000, 이 저장소의 `.claude/launch.json` 은 3200 을 쓴다.

환경변수는 `.env.local.example` 을 `.env.local` 로 복사해 채운다.

```bash
cp .env.local.example .env.local
```

## 명령

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run test` | 단위 테스트 (DB 불필요) |
| `npm run test:rls` | RLS·비정상 접근 통합 테스트 (실 DB 필요) |
| `npm run build` | 프로덕션 빌드 |
| `npx next typegen` | 라우트 타입 재생성 (`PageProps` 오류 시) |
| `npx tsc --noEmit` | 타입 검사 |
| `npm run lint` | ESLint |

## 구조에서 먼저 볼 것

| 경로 | 왜 중요한가 |
|---|---|
| `src/config/company.ts` | 사업자 정보의 **단일 출처**. 설립 후 이 파일만 고친다. 미확정 값은 `null` |
| `src/config/features.ts` | 트랙 구분과 공개 게이트. 커뮤니티 기능은 `'live'` 리터럴만 받아 규제로 막힐 수 없다 |
| `src/config/legal.ts` | 법적 고지문. 컴포넌트에 하드코딩하지 않는다 |
| `src/lib/data/queries.ts` | 데이터 접근 진입점. 키 유무로 시드/실DB 를 고른다 |
| `src/lib/data/types.ts` | 데이터 계약(`QueryProvider`). 두 구현이 이걸 만족한다 |
| `src/lib/actions/` | Server Actions. 데이터 변경은 전부 여기로만 |
| `src/proxy.ts` | 세션 갱신 + 보호 경로. Next 16 규약 (middleware 아님) |
| `supabase/migrations/0001_init.sql` | 스키마·트리거·RLS. 프로젝트 생성 후 그대로 적용 |

## 지켜야 하는 것

**커뮤니티 트랙은 규제 게이트가 없다.** 이를 유지하려면 네 가지를 지켜야 한다 (PRD §3.2).

1. 운영자는 투자 의견을 발행하지 않는다 (운영 공지만)
2. 투자정보의 대가를 받지 않는다 (유료화는 편의 기능 한정)
3. 서비스가 종목 추천·매매 신호를 만들지 않는다
4. 수익률을 표방하지 않는다 (수익률 인증·랭킹 없음)

신규 기능을 커뮤니티 트랙에 추가할 때마다 위 네 가지를 확인한다. 어긋나면 자문사 트랙으로 옮기고 게이트를 건다.

**`service_role` 키는 사용하지 않는다.** 모든 데이터 접근은 사용자 JWT 로 RLS 판정을 받는다. 이 키 하나로 접근 제어가 통째로 우회된다.

**권한 검사는 DB 에 둔다.** 화면의 버튼 숨김과 페이지의 `redirect`/`notFound` 는 편의일 뿐이다. 최종 판정은 RLS 정책이 한다 — 우회해도 DB 가 거부해야 정상이다.

**사용자 본문은 반드시 sanitize 를 통과시킨다.** `PostBody` 가 `rehype-sanitize` 로 처리한다. `dangerouslySetInnerHTML` 은 쓰지 않는다.

**`"use server"` 모듈은 모든 export 가 async 함수여야 한다.** 상수나 동기 헬퍼를 같이 내보내면 모듈 전체의 export 가 사라진다 (`src/lib/profile-rules.ts` 가 그래서 분리되어 있다).

**Next.js 16 이다.** `middleware.ts` 가 아니라 `proxy.ts` 이고, `params`·`cookies()` 는 완전 비동기다. API 를 기억으로 쓰지 말고 `node_modules/next/dist/docs/` 를 확인한다.

## 배포 전

[FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) 를 전부 통과해야 한다.

**지금 개발 편의로 꺼둔 것이 두 개 있다** — 이메일 인증, 검색엔진 색인.
둘 다 되돌리는 방법이 체크리스트 D 에 있다. 이메일 인증이 꺼져 있는 동안은
사이트 상단에 `개발 모드` 배너가 뜬다.

법적 고지문(PRD 부록 A)은 변호사 검토 전 초안이다.
