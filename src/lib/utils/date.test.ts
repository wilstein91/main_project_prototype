import { describe, expect, it } from "vitest";
import { formatCount, formatFullDate, formatListDate } from "./date";

/**
 * 날짜 표기는 KST 고정이다 (TECH_SPEC §9.4).
 * 서버와 브라우저의 시간대가 달라도 같은 문자열이 나와야 한다 —
 * 다르면 하이드레이션이 어긋난다.
 */
describe("formatListDate", () => {
  const now = new Date("2026-09-08T12:00:00+09:00");

  it("같은 날이면 시:분", () => {
    expect(formatListDate("2026-09-08T09:05:00+09:00", now)).toBe("09:05");
  });

  it("같은 해 다른 날이면 월.일", () => {
    expect(formatListDate("2026-09-06T16:05:00+09:00", now)).toBe("09.06");
  });

  it("다른 해면 연.월.일", () => {
    expect(formatListDate("2025-12-31T10:00:00+09:00", now)).toBe("25.12.31");
  });

  it("UTC 입력도 KST 로 환산한다", () => {
    // 2026-09-08T00:05:00Z = KST 09:05
    expect(formatListDate("2026-09-08T00:05:00Z", now)).toBe("09:05");
  });

  it("자정 경계: KST 로 날짜가 넘어가는 것을 반영한다", () => {
    // 2026-09-07T15:30:00Z = KST 2026-09-08 00:30 → 같은 날
    expect(formatListDate("2026-09-07T15:30:00Z", now)).toBe("00:30");
    // 2026-09-07T14:30:00Z = KST 2026-09-07 23:30 → 전날
    expect(formatListDate("2026-09-07T14:30:00Z", now)).toBe("09.07");
  });
});

describe("formatFullDate", () => {
  it("연.월.일 시:분 (KST)", () => {
    expect(formatFullDate("2026-09-06T16:05:00+09:00")).toBe("2026.09.06 16:05");
  });

  it("UTC 를 KST 로 환산한다", () => {
    expect(formatFullDate("2026-09-06T07:05:00Z")).toBe("2026.09.06 16:05");
  });
});

describe("formatCount", () => {
  it("천 단위 구분", () => {
    expect(formatCount(1234)).toBe("1,234");
    expect(formatCount(0)).toBe("0");
    expect(formatCount(1000000)).toBe("1,000,000");
  });
});
