// ─────────────────────────────────────────────────────────────
// 트랙 분리와 기능 게이트 — TECH_SPEC §9.6 / PRD §3
//
// 핵심은 커뮤니티 트랙 기능에 게이트를 걸 수 없게 만드는 것이다.
// CommunityFeature 는 GateState 가 아니라 'live' 리터럴만 받으므로,
// 규제 상태와 무관해야 할 기능이 실수로 막히면 컴파일이 깨진다.
// ─────────────────────────────────────────────────────────────

export type GateState = "hidden" | "under_construction" | "live";

/** 커뮤니티 트랙 — 규제 게이트 없음. 항상 live (PRD §3.2 불변조건) */
export type CommunityFeature =
  | "board" //            게시판·댓글
  | "serviceAbout" //     서비스 소개 /about
  | "policyPages" //      약관·개인정보·투자 유의사항
  | "reactions" //        추천·인기글        (Phase 2)
  | "search" //           검색               (Phase 2)
  | "uploads" //          이미지 업로드      (Phase 2)
  | "notifications" //    인앱 알림          (Phase 2)
  | "reports" //          신고·임시조치      (Phase 2)
  | "activityTiers" //    회원 등급          (Phase 3)
  | "tags" //             종목 태그          (Phase 3)
  | "stockPages" //       종목 페이지·시세   (Phase 3)
  | "trendingStocks" //   화제 종목 (집계)   (Phase 3)
  | "newsBoard" //        뉴스 공유 게시판   (Phase 4)
  | "newsFeed" //         뉴스 자동 수집     (Phase 4)
  | "disclosures" //      공시·캘린더        (Phase 4)
  | "watchlist" //        관심 종목          (Phase 4)
  | "liveChat" //         실시간 채팅        (Phase 5)
  | "bannerAds"; //       배너 광고          (Phase 5)

/** 자문사 트랙 — 규제 게이트 적용 */
export type AdvisoryFeature =
  | "companyIntro" //  자문사 소개 /company
  | "advisoryIntro" // 자문 서비스 안내 /advisory
  | "researchBoard"; // 리서치 게시판        (Phase 4)

export type FeatureKey = CommunityFeature | AdvisoryFeature;

/**
 * 'live' 리터럴 타입에 주의 — 여기에 'hidden' 을 쓰면 컴파일 에러다.
 * 의도한 제약이며 우회하지 않는다.
 *
 * phase 는 개발 순서 기록용이며 런타임 판정에 쓰지 않는다.
 * 아직 만들지 않은 기능은 코드가 없으므로 라우트도 없다.
 */
const COMMUNITY: Record<
  CommunityFeature,
  { state: "live"; phase: number }
> = {
  board: { state: "live", phase: 1 },
  serviceAbout: { state: "live", phase: 1 },
  policyPages: { state: "live", phase: 1 },
  reactions: { state: "live", phase: 2 },
  search: { state: "live", phase: 2 },
  uploads: { state: "live", phase: 2 },
  notifications: { state: "live", phase: 2 },
  reports: { state: "live", phase: 2 },
  activityTiers: { state: "live", phase: 3 },
  tags: { state: "live", phase: 3 },
  stockPages: { state: "live", phase: 3 },
  trendingStocks: { state: "live", phase: 3 },
  newsBoard: { state: "live", phase: 4 },
  newsFeed: { state: "live", phase: 4 },
  disclosures: { state: "live", phase: 4 },
  watchlist: { state: "live", phase: 4 },
  liveChat: { state: "live", phase: 5 },
  bannerAds: { state: "live", phase: 5 },
};

const ADVISORY: Record<
  AdvisoryFeature,
  { state: GateState; unblockedBy: string }
> = {
  companyIntro: {
    state: "under_construction",
    unblockedBy: "법인 설립 완료",
  },
  advisoryIntro: {
    state: "hidden",
    unblockedBy: "자문업 신고·등록 완료",
  },
  researchBoard: {
    state: "hidden",
    unblockedBy: "자문업 신고·등록 완료",
  },
};

export const isCommunityFeature = (k: FeatureKey): k is CommunityFeature =>
  k in COMMUNITY;

export function gate(k: FeatureKey): GateState {
  return isCommunityFeature(k) ? COMMUNITY[k].state : ADVISORY[k].state;
}

export function unblockedBy(k: AdvisoryFeature): string {
  return ADVISORY[k].unblockedBy;
}

export const isLive = (k: FeatureKey) => gate(k) === "live";
export const isVisible = (k: FeatureKey) => gate(k) !== "hidden";

/**
 * PRD §3.3 금지 기능은 CommunityFeature 에 **키 자체를 만들지 않는다.**
 * 필요해지면 AdvisoryFeature 로 추가하고 게이트를 건다.
 *
 *   수익률 인증·랭킹 · 종목 추천 목록 · 매매 신호 · 목표가 ·
 *   종목 진단 점수/등급 · **모든 형태의 유료 구독·멤버십**
 *
 * `paidResearch`(유료 투자정보 멤버십)와 `perkSubscription`(커뮤니티 편의
 * 구독)은 **PRD v0.4 에서 삭제됐다.** 이 서비스는 이용자에게 요금을 받지
 * 않는다 (I-2) — 커뮤니티는 자문·일임 사업으로 가는 유입 경로이고, 수익은
 * `bannerAds` 하나뿐이다. 다시 넣으려면 PRD §3.2 I-2 부터 고쳐야 한다.
 *
 * `trendingStocks` 는 금지 기능이 아니다 — 운영 주체가 종목을 고르는 것이
 * 아니라 공개 지표(언급량·조회수·등락률·거래량)를 기계적으로 집계하는
 * 것이며, 화면에 집계 기준과 매수·매도 권유가 아니라는 고지를 함께
 * 표시한다 (I-3 · PRD §A-5-2). 이 조건이 빠지면 금지 기능이 된다.
 */
