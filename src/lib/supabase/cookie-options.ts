/**
 * 인증 쿠키 옵션 강화 — FINAL_CHECKLIST §C-5
 *
 * ## 무엇이 문제였나
 *
 * `@supabase/ssr` 이 심는 세션 쿠키(`sb-<ref>-auth-token`)는 기본값이
 * **httpOnly 가 아니다.** 브라우저 콘솔에서 확인했더니 `document.cookie`
 * 로 access token 과 **refresh token 이 그대로 읽혔다.**
 *
 * refresh token 이 읽히면 XSS 한 번으로 계정이 넘어간다. access token 은
 * 1시간이면 만료되지만 refresh token 은 새 access token 을 계속 받아낼 수
 * 있어서, 비밀번호를 바꿔도 세션을 끊기 전까지 유지된다.
 *
 * ## 왜 기본값이 그런가, 그리고 왜 우리는 바꿀 수 있는가
 *
 * 라이브러리 기본 구성은 **브라우저의 Supabase 클라이언트도 같은 쿠키를
 * 읽는다**고 가정한다. httpOnly 를 걸면 그쪽이 세션을 못 읽는다.
 *
 * 이 앱에는 브라우저 Supabase 클라이언트가 없다. 모든 DB 접근은 서버
 * 컴포넌트와 Server Action 을 거친다 (`createBrowserClient` 사용처 0곳,
 * 확인함). 그래서 httpOnly 를 걸어도 잃는 것이 없다.
 *
 * **브라우저에서 Supabase 를 직접 호출하기로 방향을 바꾸면 이 파일 때문에
 * 로그인이 깨진다.** 그때는 여기를 지우기 전에 왜 걸었는지부터 읽을 것.
 */

/** 개발 중에는 http 로 접속하므로 secure 를 걸면 쿠키가 버려진다 */
const IS_PROD = process.env.NODE_ENV === "production";

type CookieOpts = {
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
  maxAge?: number;
  expires?: Date;
  domain?: string;
};

export function hardenAuthCookie(options?: CookieOpts): CookieOpts {
  return {
    ...options,
    path: options?.path ?? "/",
    // 핵심 — 스크립트가 세션을 읽지 못하게 한다
    httpOnly: true,
    // 다른 사이트에서 넘어온 요청에는 쿠키를 붙이지 않는다 (CSRF 완화).
    // strict 로 두면 외부 링크로 들어올 때 로그인이 풀린 것처럼 보인다.
    sameSite: options?.sameSite ?? "lax",
    // 운영에서는 https 로만 전송
    secure: IS_PROD ? true : options?.secure,
  };
}
