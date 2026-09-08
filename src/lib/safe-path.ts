/**
 * 내부 경로 검증 — 오픈 리다이렉트 방지
 *
 * `?redirect=` `?next=` 처럼 사용자가 준 값으로 이동할 때 쓴다.
 * 검증이 허술하면 우리 도메인의 로그인 링크가 외부 사이트로 보내는
 * 통로가 된다 (피싱).
 *
 * 처음에는 이렇게 썼는데 부족했다.
 *
 *   if (!v.startsWith("/") || v.startsWith("//")) return "/";
 *
 * `/\evil.com` 이 통과한다. 브라우저는 URL 안의 역슬래시를 슬래시로
 * 해석하므로 `//evil.com` 과 같아지고, 프로토콜 상대 주소가 되어
 * 외부로 나간다. 탭·개행 같은 제어문자도 비슷하게 무시되거나 제거된다.
 *
 * 그래서 문자열 검사에 의존하지 않고 **실제로 파싱해서 출신을 확인**한다.
 */

/** 파싱 기준이 되는 가짜 출신. 실제로 존재하지 않는 TLD 를 쓴다. */
const SENTINEL_ORIGIN = "https://internal.invalid";

export function safeInternalPath(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (typeof value !== "string") return fallback;

  const raw = value.trim();
  if (raw === "" || !raw.startsWith("/")) return fallback;

  // 역슬래시는 브라우저가 슬래시로 해석한다 (`/\evil.com` → `//evil.com`)
  if (raw.includes("\\")) return fallback;
  // 제어문자(탭·개행 등)는 URL 파싱 중 제거되어 우회에 쓰인다
  for (const ch of raw) {
    const code = ch.codePointAt(0)!;
    if (code < 0x20 || code === 0x7f) return fallback;
  }

  try {
    const url = new URL(raw, SENTINEL_ORIGIN);
    // `//evil.com` 처럼 출신이 바뀌면 외부 주소다
    if (url.origin !== SENTINEL_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
