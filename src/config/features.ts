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
  | "tags" //             종목 태그          (Phase 3)
  | "activityTiers" //    활동 기반 등급     (Phase 3)
  | "perkSubscription" // 커뮤니티 편의 구독 (Phase 4)
  | "liveChat"; //        실시간 채팅        (Phase 4)

/** 자문사 트랙 — 규제 게이트 적용 */
export type AdvisoryFeature =
  | "companyIntro" //  자문사 소개 /company
  | "advisoryIntro" // 자문 서비스 안내 /advisory
  | "researchBoard" // 리서치 게시판         (Phase 3)
  | "paidResearch"; // 유료 투자정보 멤버십  (Phase 4)

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
  tags: { state: "live", phase: 3 },
  activityTiers: { state: "live", phase: 3 },
  perkSubscription: { state: "live", phase: 4 },
  liveChat: { state: "live", phase: 4 },
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
  paidResearch: {
    state: "hidden",
    unblockedBy: "자문업 등록 + 결제 심사",
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
 * PRD §3.3 금지 기능(수익률 인증·랭킹, 종목 추천, 매매 신호)은
 * CommunityFeature 에 키 자체를 만들지 않는다.
 * 필요해지면 AdvisoryFeature 로 추가하고 게이트를 건다.
 */
