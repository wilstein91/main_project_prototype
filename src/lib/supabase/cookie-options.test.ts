import { describe, expect, it } from "vitest";
import { hardenAuthCookie } from "./cookie-options";

/**
 * 세션 쿠키가 스크립트에 읽히면 XSS 한 번으로 계정이 넘어간다.
 * 실제로 `document.cookie` 에서 refresh token 이 보이는 상태였다.
 *
 * 이 테스트는 그 상태로 되돌아가는 것을 막는다. `httpOnly` 가 빠지는
 * 변경은 화면에서 아무 증상도 내지 않으므로 사람 눈으로는 못 잡는다.
 */
describe("인증 쿠키 옵션", () => {
  it("httpOnly 를 항상 강제한다", () => {
    expect(hardenAuthCookie().httpOnly).toBe(true);
    // 라이브러리가 false 로 줘도 덮는다
    expect(hardenAuthCookie({ httpOnly: false }).httpOnly).toBe(true);
  });

  it("sameSite 기본값은 lax 다", () => {
    expect(hardenAuthCookie().sameSite).toBe("lax");
    // 명시적으로 준 값은 존중한다
    expect(hardenAuthCookie({ sameSite: "strict" }).sameSite).toBe("strict");
  });

  it("path 기본값은 / 다", () => {
    expect(hardenAuthCookie().path).toBe("/");
    expect(hardenAuthCookie({ path: "/auth" }).path).toBe("/auth");
  });

  it("만료 정보 같은 나머지 옵션은 건드리지 않는다", () => {
    const out = hardenAuthCookie({ maxAge: 3600, domain: "example.com" });
    expect(out.maxAge).toBe(3600);
    expect(out.domain).toBe("example.com");
  });

  it("개발 환경에서는 secure 를 강제하지 않는다", () => {
    // http://localhost 에서 secure 를 걸면 브라우저가 쿠키를 버려
    // 로그인이 되지 않는다. 운영에서만 켠다.
    expect(process.env.NODE_ENV).not.toBe("production");
    expect(hardenAuthCookie().secure).toBeUndefined();
  });
});
