// ─────────────────────────────────────────────────────────────
// 커뮤니티 기능 레지스트리 — PRD §3
//
// 이 저장소에는 **규제 게이트가 없다.** 자문사 트랙(자문사 소개·자문
// 서비스 안내·리서치 게시판)을 2026-09-09 에 별도 웹사이트로 내보냈고
// (PRD O-9), 그 결과 이 사이트는 전부 커뮤니티 트랙이 되었다.
// 옮긴 자료는 ADVISORY_TRACK_MOVED.md 에 있다.
//
// 그래서 이 파일이 남아서 하는 일은 하나다 —
// **PRD §3.3 금지 기능의 키를 만들지 못하게 지키는 것.**
// features.test.ts 가 그것을 검사한다.
// ─────────────────────────────────────────────────────────────

/**
 * 커뮤니티 기능. 전부 규제 게이트 없이 공개된다 (PRD §3.2 불변조건).
 *
 * 여기 없는 기능을 만들 때는 먼저 PRD §3.2 I-1~I-5 에 비춰 본다.
 * 걸리면 키를 만들지 말고 자문사 사이트로 보낸다.
 */
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

/** phase 는 개발 순서 기록용이며 런타임 판정에 쓰지 않는다. */
const COMMUNITY: Record<CommunityFeature, { phase: number }> = {
  board: { phase: 1 },
  serviceAbout: { phase: 1 },
  policyPages: { phase: 1 },
  reactions: { phase: 2 },
  search: { phase: 2 },
  uploads: { phase: 2 },
  notifications: { phase: 2 },
  reports: { phase: 2 },
  activityTiers: { phase: 3 },
  tags: { phase: 3 },
  stockPages: { phase: 3 },
  trendingStocks: { phase: 3 },
  newsBoard: { phase: 4 },
  newsFeed: { phase: 4 },
  disclosures: { phase: 4 },
  watchlist: { phase: 4 },
  liveChat: { phase: 5 },
  bannerAds: { phase: 5 },
};

export const isCommunityFeature = (k: string): k is CommunityFeature =>
  k in COMMUNITY;

export const featurePhase = (k: CommunityFeature): number => COMMUNITY[k].phase;

/**
 * PRD §3.3 금지 기능은 여기에 **키 자체를 만들지 않는다.**
 *
 *   수익률 인증·랭킹 · 종목 추천 목록 · 매매 신호 · 목표가 ·
 *   종목 진단 점수/등급 · 모든 형태의 유료 구독·멤버십
 *
 * `paidResearch`(유료 투자정보 멤버십)와 `perkSubscription`(커뮤니티 편의
 * 구독)은 PRD v0.4 에서 삭제됐다. 이 서비스는 이용자에게 요금을 받지
 * 않는다 (I-2) — 커뮤니티는 자문·일임 사업으로 가는 유입 경로이고, 수익은
 * `bannerAds` 하나뿐이다. 다시 넣으려면 PRD §3.2 I-2 부터 고쳐야 한다.
 *
 * `trendingStocks` 는 금지 기능이 아니다 — 운영 주체가 종목을 고르는 것이
 * 아니라 공개 지표(언급량·조회수·등락률·거래량)를 기계적으로 집계하는
 * 것이며, 화면에 집계 기준과 매수·매도 권유가 아니라는 고지를 함께
 * 표시한다 (I-3 · PRD §A-5-2). 이 조건이 빠지면 금지 기능이 된다.
 */
