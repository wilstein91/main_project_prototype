import { describe, expect, it } from "vitest";
import { ANON_KEY, hasConfig, SUPABASE_URL } from "./helpers";

/**
 * 비정상 접근 대응 검증 — FINAL_CHECKLIST.md B 항목
 *
 * "의도한 방식으로 접근하지 않는 사용자" 를 상대로 500 이나 스택 트레이스가
 * 나오지 않고, 계정 존재 여부 같은 정보가 새지 않는지 확인한다.
 *
 * 앱(배포본)과 인증 서버를 직접 두드린다. 화면 조작이 아니라 HTTP 로
 * 확인하므로 UI 를 우회한 요청도 포함된다.
 */

const APP = process.env.APP_URL?.trim() || "https://namjosunhero.vercel.app";

async function authCall(body: unknown) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, text };
}

describe.skipIf(!hasConfig)("로그인 비정상 입력", () => {
  it("없는 계정으로 로그인해도 500 이 아니다", async () => {
    const r = await authCall({
      email: "definitely-not-registered-xyz@example.invalid",
      password: "whatever-12345",
    });
    expect(r.status).toBe(400);
    expect(r.text).toContain("invalid_credentials");
  });

  it("계정 존재 여부를 구분해 알려주지 않는다 (열거 방지)", async () => {
    const missing = await authCall({
      email: "definitely-not-registered-xyz@example.invalid",
      password: "wrong-password-123",
    });
    const existing = await authCall({
      email: process.env.TEST_MEMBER_EMAIL ?? "tester@namjosunhero.local",
      password: "definitely-the-wrong-password-123",
    });
    // 두 응답이 같아야 한다 — 다르면 어떤 이메일이 가입돼 있는지 알아낼 수 있다
    expect(existing.status).toBe(missing.status);
    expect(existing.text).toContain("invalid_credentials");
  });

  it("비밀번호 없이 로그인해도 500 이 아니다", async () => {
    const r = await authCall({ email: "someone@example.invalid" });
    expect(r.status).toBeGreaterThanOrEqual(400);
    expect(r.status).toBeLessThan(500);
  });

  it("이메일 없이 로그인해도 500 이 아니다", async () => {
    const r = await authCall({ password: "whatever-12345" });
    expect(r.status).toBeGreaterThanOrEqual(400);
    expect(r.status).toBeLessThan(500);
  });

  it("빈 본문·잘못된 타입에도 500 이 아니다", async () => {
    for (const body of [{}, { email: 123, password: [] }, { email: null }]) {
      const r = await authCall(body);
      expect(r.status, JSON.stringify(body)).toBeLessThan(500);
    }
  });
});

describe("앱 라우팅 — 비정상 접근", () => {
  /** 리다이렉트를 따라가지 않고 Location 헤더만 본다 */
  async function head(path: string) {
    const res = await fetch(`${APP}${path}`, { redirect: "manual" });
    return { status: res.status, location: res.headers.get("location") ?? "" };
  }

  it("로그인 없이 즐겨찾기한 보호 페이지로 직접 들어가면 로그인으로 보낸다", async () => {
    for (const p of ["/write", "/settings", "/admin"]) {
      const r = await head(p);
      expect([302, 303, 307, 308], p).toContain(r.status);
      expect(r.location, p).toContain("/login");
      expect(r.location, p).toContain("redirect=");
    }
  });

  it("없는 글 번호로 들어가면 404 다 (500 아님)", async () => {
    for (const p of ["/c/free/999999", "/c/free/0", "/c/free/-1"]) {
      const r = await head(p);
      expect(r.status, p).toBe(404);
    }
  });

  it("글 번호에 숫자가 아닌 값을 넣어도 404 다", async () => {
    for (const p of [
      "/c/free/abc",
      "/c/free/1abc",
      "/c/free/%27",
      "/c/free/1%20OR%201=1",
      "/c/free/null",
    ]) {
      const r = await head(p);
      expect(r.status, p).toBe(404);
    }
  });

  it("없는 카테고리는 404 다", async () => {
    const r = await head("/c/nope");
    expect(r.status).toBe(404);
  });

  it("경로 탐색 시도는 정규화되어 넘어간다 (500 이 아니다)", async () => {
    // Next/Vercel 이 `..` 를 정규화해 상위 경로로 보낸다. 탐색은 일어나지
    // 않으며 500 도 아니다 — 이 두 가지가 확인 대상이다.
    for (const p of ["/c/../etc", "/c/%2e%2e", "/c/free/../../etc"]) {
      const res = await fetch(`${APP}${p}`);
      expect(res.status, p).toBeLessThan(500);
      const html = await res.text();
      expect(html, p).not.toContain("node_modules");
      expect(html, p).not.toContain(".supabase.co");
    }
  });

  it("숨긴 자문사 경로는 404 다 (존재를 알리지 않는다)", async () => {
    const r = await head("/advisory");
    expect(r.status).toBe(404);
  });

  it("글 목록 page 파라미터에 이상한 값이 와도 200 이다", async () => {
    for (const p of [
      "/c/free?page=0",
      "/c/free?page=-5",
      "/c/free?page=abc",
      "/c/free?page=99999",
      "/c/free?page[]=1",
    ]) {
      const res = await fetch(`${APP}${p}`);
      expect(res.status, p).toBe(200);
    }
  });

  it("존재하지 않는 경로는 404 다", async () => {
    const r = await head("/이런페이지없음");
    expect(r.status).toBe(404);
  });

  it("오류 화면에 스택 트레이스나 내부 경로가 노출되지 않는다", async () => {
    const res = await fetch(`${APP}/c/free/999999`);
    const html = await res.text();
    for (const leak of [
      "at Object.",
      "node_modules",
      "webpack",
      "SUPABASE_",
      "sb_publishable_",
      "sb_secret_",
      ".supabase.co",
    ]) {
      expect(html, leak).not.toContain(leak);
    }
  });
});

describe("공개 키 노출 범위", () => {
  it("브라우저 번들에 Supabase 키·주소가 들어가지 않는다", async () => {
    // 서버에서만 쓰므로 HTML 어디에도 나오면 안 된다
    const html = await fetch(`${APP}/`).then((r) => r.text());
    expect(html).not.toContain("sb_publishable_");
    expect(html).not.toContain(".supabase.co");
  });

  it("secret 키 형태의 문자열이 어디에도 없다", async () => {
    for (const p of ["/", "/login", "/signup", "/c/free"]) {
      const html = await fetch(`${APP}${p}`).then((r) => r.text());
      expect(html, p).not.toContain("sb_secret_");
      expect(html, p).not.toContain("service_role");
    }
  });
});
