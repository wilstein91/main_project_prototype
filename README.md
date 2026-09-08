# 영웅호걸닷컴 (가칭)

투자정보 공유 커뮤니티 플랫폼. 개인 투자자들이 정보와 의견을 나누는 게시판 서비스다.

- [PRD.md](PRD.md) — 요구사항, 트랙 분리 정책, 법적 고지문
- [TECH_SPEC.md](TECH_SPEC.md) — 아키텍처, DB 스키마·RLS, 작업 티켓

## 현재 상태

**Phase 1 화면 형상까지 구현됨.** 인증과 DB 는 연결되지 않았다.

- 화면·라우팅·레이아웃·게이트: 동작
- 데이터: `src/lib/data/seed.ts` 시드를 읽는다
- 폼(로그인·가입·글쓰기): 구조만 있고 제출은 비활성

화면에 `개발 중` 안내가 보이는 곳이 아직 연결되지 않은 부분이다. 실서비스 배포 전에는 하나도 남아 있지 않아야 한다.

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
| `src/lib/data/queries.ts` | 데이터 접근 계층. Supabase 연결 시 본문만 교체한다 |
| `supabase/migrations/0001_init.sql` | 스키마·트리거·RLS. Supabase 생성 후 그대로 적용 |

## 지켜야 하는 것

**커뮤니티 트랙은 규제 게이트가 없다.** 이를 유지하려면 네 가지를 지켜야 한다 (PRD §3.2).

1. 운영자는 투자 의견을 발행하지 않는다 (운영 공지만)
2. 투자정보의 대가를 받지 않는다 (유료화는 편의 기능 한정)
3. 서비스가 종목 추천·매매 신호를 만들지 않는다
4. 수익률을 표방하지 않는다 (수익률 인증·랭킹 없음)

신규 기능을 커뮤니티 트랙에 추가할 때마다 위 네 가지를 확인한다. 어긋나면 자문사 트랙으로 옮기고 게이트를 건다.

**`service_role` 키는 사용하지 않는다.** 모든 데이터 접근은 사용자 JWT 로 RLS 판정을 받는다. 이 키 하나로 접근 제어가 통째로 우회된다.

**Next.js 16 이다.** `middleware.ts` 가 아니라 `proxy.ts` 이고, `params`·`cookies()` 는 완전 비동기다. API 를 기억으로 쓰지 말고 `node_modules/next/dist/docs/` 를 확인한다.

## 배포 전

[TECH_SPEC.md §10](TECH_SPEC.md) 의 보안·운영 체크리스트를 전부 통과해야 한다. 키 재발급, 이메일 확인, 비밀번호 유출 검사, CAPTCHA·rate limit, RLS, 도메인·Redirect URL, 백업, 무료 티어 한계 — 그리고 §10.9 트랙 분리·규제 표기 점검.

법적 고지문(PRD 부록 A)은 변호사 검토 전 초안이다.
