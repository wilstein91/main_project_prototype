import { describe, expect, it } from "vitest";
import {
  featurePhase,
  isCommunityFeature,
  type CommunityFeature,
} from "./features";

/**
 * 기능 레지스트리 검증 (PRD §3).
 *
 * 자문사 트랙을 별도 웹사이트로 내보낸 뒤(PRD O-9) 이 저장소에는 규제
 * 게이트가 없다. 그래서 이 테스트가 지키는 것은 하나다 —
 * **금지 기능(§3.3)의 키가 커뮤니티에 생기지 않는 것.**
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
  "activityTiers",
  "tags",
  "stockPages",
  "trendingStocks",
  "newsBoard",
  "newsFeed",
  "disclosures",
  "watchlist",
  "liveChat",
  "bannerAds",
];

describe("커뮤니티 기능 레지스트리", () => {
  it.each(COMMUNITY)("%s 는 등록되어 있다", (key) => {
    expect(isCommunityFeature(key)).toBe(true);
  });

  it.each(COMMUNITY)("%s 는 페이즈가 기록되어 있다", (key) => {
    expect(featurePhase(key)).toBeGreaterThanOrEqual(1);
  });

  /**
   * Phase 5 로 끝낸다 (PRD §12). 6 이 나오면 로드맵이 늘어난 것이므로
   * PRD 부터 고친다.
   */
  it("페이즈는 1~5 안에 있다", () => {
    for (const k of COMMUNITY) {
      expect(featurePhase(k), k).toBeLessThanOrEqual(5);
    }
  });
});

describe("금지 기능 (PRD §3.3)", () => {
  /**
   * 아래 키가 커뮤니티 기능으로 등록되면 이 테스트가 깨진다.
   * 깨졌다면 기능을 되돌리거나, 정말 필요하면 PRD §3.2 불변조건부터
   * 고치고 근거를 남긴다.
   */
  const FORBIDDEN = [
    // I-4 — 수익률 표방
    "returnRanking",
    "profitVerification",
    "accountSync",
    // I-3 — 운영 주체가 종목을 고르는 것
    "stockRecommendation",
    "tradingSignal",
    "stockScore",
    "targetPrice",
    // I-2 — 이용자에게 요금을 받는 것 (PRD v0.4 에서 전면 제외)
    "paidResearch",
    "perkSubscription",
    "paidSubscription",
    "membership",
    // 자문사 트랙 — 별도 웹사이트로 내보냈다 (O-9)
    "companyIntro",
    "advisoryIntro",
    "researchBoard",
  ];

  it.each(FORBIDDEN)("%s 는 커뮤니티 기능으로 등록되어 있지 않다", (key) => {
    expect(isCommunityFeature(key)).toBe(false);
  });
});
