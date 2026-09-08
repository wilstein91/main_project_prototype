import { describe, expect, it } from "vitest";
import {
  gate,
  isCommunityFeature,
  isLive,
  isVisible,
  type AdvisoryFeature,
  type CommunityFeature,
} from "./features";

/**
 * 트랙 분리 검증 (PRD §3).
 *
 * 이 테스트의 목적은 두 방향을 동시에 막는 것이다.
 *   - 자문사 기능이 실수로 공개되는 것
 *   - **커뮤니티 기능이 실수로 막히는 것** ← 이쪽이 더 조용히 일어난다
 */

const COMMUNITY: CommunityFeature[] = [
  "board",
  "serviceAbout",
  "policyPages",
  "reactions",
  "search",
  "uploads",
  "notifications",
  "reports",
  "tags",
  "activityTiers",
  "perkSubscription",
  "liveChat",
];

const ADVISORY: AdvisoryFeature[] = [
  "companyIntro",
  "advisoryIntro",
  "researchBoard",
  "paidResearch",
];

describe("커뮤니티 트랙은 규제로 막히지 않는다", () => {
  it.each(COMMUNITY)("%s 는 항상 live 다", (key) => {
    expect(gate(key)).toBe("live");
    expect(isLive(key)).toBe(true);
    expect(isVisible(key)).toBe(true);
  });

  it("커뮤니티 기능으로 인식된다", () => {
    for (const k of COMMUNITY) expect(isCommunityFeature(k), k).toBe(true);
  });
});

describe("자문사 트랙은 게이트를 통과해야 공개된다", () => {
  it("자문사 기능으로 인식된다 (커뮤니티가 아니다)", () => {
    for (const k of ADVISORY) expect(isCommunityFeature(k), k).toBe(false);
  });

  it.each(ADVISORY)("%s 는 3단계 중 하나의 상태를 갖는다", (key) => {
    expect(["hidden", "under_construction", "live"]).toContain(gate(key));
  });

  /**
   * 인허가 전 현재 상태를 고정한다. 아래가 깨지면 규제 게이트가 열린
   * 것이므로, 인허가가 실제로 완료되었는지 확인한 뒤에만 기대값을 고친다.
   */
  it("인허가 전에는 자문 관련 기능이 공개되지 않는다", () => {
    expect(gate("advisoryIntro")).toBe("hidden");
    expect(gate("researchBoard")).toBe("hidden");
    expect(gate("paidResearch")).toBe("hidden");
  });

  it("법인 설립 전 자문사 소개는 준비 중이다", () => {
    expect(gate("companyIntro")).toBe("under_construction");
  });

  it("hidden 은 보이지도 않는다", () => {
    expect(isVisible("advisoryIntro")).toBe(false);
    expect(isLive("advisoryIntro")).toBe(false);
  });

  it("under_construction 은 보이지만 live 는 아니다", () => {
    expect(isVisible("companyIntro")).toBe(true);
    expect(isLive("companyIntro")).toBe(false);
  });
});

describe("금지 기능 (PRD §3.3)", () => {
  /**
   * 수익률 인증·랭킹, 종목 추천, 매매 신호는 커뮤니티 트랙에 키를 만들지
   * 않는다. 누군가 추가하면 이 테스트가 깨진다.
   */
  const FORBIDDEN = [
    "returnRanking",
    "profitVerification",
    "stockRecommendation",
    "tradingSignal",
    "accountSync",
  ];

  it.each(FORBIDDEN)("%s 는 커뮤니티 기능으로 등록되어 있지 않다", (key) => {
    expect(isCommunityFeature(key as CommunityFeature)).toBe(false);
  });
});
