import type { NextConfig } from "next";

/**
 * 보안 헤더 — FINAL_CHECKLIST §C
 *
 * 배포본을 찔러보니 HSTS 하나만 있었다 (Vercel 이 붙여준다). 나머지는
 * 우리가 붙여야 한다.
 *
 * ## 왜 CSP 를 전부 걸지 않는가
 *
 * `script-src` 를 조이는 것이 CSP 의 핵심이지만, Next.js 는 하이드레이션
 * 데이터를 인라인 `<script>` 로 넣기 때문에 nonce 를 매 요청 생성해
 * 흘려보내야 한다. 그 배선을 MVP 에서 잘못 넣으면 **화면이 아예 안 뜨는**
 * 실패로 나타난다.
 *
 * 그래서 **스크립트 로딩과 무관하지만 실제 공격을 막는 지시문만** 켠다.
 * 이 넷은 켜도 앱 동작이 바뀌지 않는다.
 *
 *   frame-ancestors 'none'  — 로그인 화면을 iframe 에 올려 클릭을 훔치는
 *                             클릭재킹을 막는다 (X-Frame-Options 의 후속)
 *   form-action 'self'      — 주입된 폼이 비밀번호를 외부로 전송하는 것을 막는다
 *   base-uri 'self'         — <base> 주입으로 상대 경로를 외부로 돌리는 것을 막는다
 *   object-src 'none'       — 플러그인 삽입 차단
 *
 * `script-src` 는 Phase 2 에서 nonce 배선과 함께 넣는다 (TECH_SPEC §10).
 */
const CSP = [
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  // CSP 를 모르는 구형 브라우저용. frame-ancestors 와 목적이 같다
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: CSP },
  // 선언된 타입과 다르게 추측해 실행하는 것을 막는다 (업로드 도입 시 특히 중요)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 외부 링크로 나갈 때 전체 주소를 보내지 않는다 (글 주소가 새어나가지 않게)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 쓰지 않는 장치 권한은 닫는다
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  // `X-Powered-By: Next.js` 를 지운다. 프레임워크와 버전대를 알려주면
  // 알려진 취약점을 겨냥한 자동 스캔의 표적이 좁아진다
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
