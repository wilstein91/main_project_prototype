import { describe, expect, it } from "vitest";
import { safeInternalPath } from "@/lib/safe-path";

// 오픈 리다이렉트 실전 목록 — 프로덕션에서 찔러본 것 + 흔한 우회
const ATTACKS = [
  "//evil.com", "///evil.com", "/\evil.com", "\\evil.com",
  "https://evil.com", "http://evil.com", "//evil.com/path",
  "/%2f%2fevil.com", "/%5cevil.com", "javascript:alert(1)",
  "java\nscript:alert(1)", "/\u0000/evil.com", "//evil.com\t",
  " //evil.com", "/..//evil.com", "//evil.com#/a", "/@evil.com",
  "//@evil.com", "/\r\nLocation: https://evil.com",
];

describe("오픈 리다이렉트 방어", () => {
  for (const a of ATTACKS) {
    it(`차단: ${JSON.stringify(a)}`, () => {
      const out = safeInternalPath(a);
      // 외부로 나갈 수 있는 형태가 아니어야 한다
      expect(out.startsWith("/")).toBe(true);
      expect(out.startsWith("//")).toBe(false);
      expect(out.startsWith("/\\")).toBe(false);
      /*
       * `/@evil.com` 은 걸러내지 않는다. 같은 출신의 경로일 뿐이고
       * (`namjosunhero.vercel.app/@evil.com` → 404), 브라우저가 호스트로
       * 읽는 형태가 아니다. 막으면 나중에 `/@닉네임` 같은 주소 체계를
       * 쓸 수 없게 된다.
       */
      expect(out).not.toMatch(/[\r\n\t\0]/);
      expect(out.toLowerCase()).not.toContain("javascript:");
    });
  }
  it("정상 경로는 통과", () => {
    expect(safeInternalPath("/write")).toBe("/write");
    expect(safeInternalPath("/c/free?page=2")).toBe("/c/free?page=2");
  });
});
