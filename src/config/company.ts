// ─────────────────────────────────────────────────────────────
// 사업자 정보 — 단일 출처 (TECH_SPEC §9.5)
//
// 설립·신고 완료 시 이 파일만 수정한다. 다른 파일은 손대지 않는다.
// 미확정 값은 반드시 null 로 둔다. 형식만 맞춘 더미 값을 넣지 않는다.
// (PRD §3.6 — 더미 사업자등록번호도 허위 표기로 읽힐 수 있다)
// ─────────────────────────────────────────────────────────────

export type IncorporationStatus = "pre_incorporation" | "incorporated";
export type AdvisoryStatus = "none" | "quasi_advisory" | "investment_advisory";

export const COMPANY = {
  /** 법인 설립 상태 — 커뮤니티 트랙은 이 값에 영향받지 않는다 */
  incorporation: "pre_incorporation" as IncorporationStatus,
  /** 자문업 신고·등록 상태 — 자문사 트랙 게이트만 참조한다 */
  advisory: "none" as AdvisoryStatus,

  /** 서비스 가칭 — 인허가 연상 표현을 넣지 않는다 (PRD C-8) */
  serviceName: "영웅호걸닷컴",
  /** true 이면 화면 표기에 '(가칭)' 을 병기한다 */
  isTentativeName: true,

  tagline: "개인 투자자들이 정보와 의견을 나누는 곳",

  /** 운영 주체 표기 (PRD §3.6) */
  operator: "개인 운영",

  /** 이하 미확정 항목 — 설립 후 실제 값으로 채운다 */
  legalName: null as string | null, // 상호
  ceo: null as string | null, // 대표자
  bizRegNo: null as string | null, // 사업자등록번호
  address: null as string | null, // 소재지
  advisoryRegNo: null as string | null, // 자문업 등록·신고번호

  /** 문의 대응용 — 유일하게 실제 값이 들어가는 항목 */
  contactEmail: "contact@example.com",

  /**
   * 자문·일임사 웹사이트 주소. 이 커뮤니티는 그리로 가는 유입 경로다.
   * 값이 들어가면 푸터에 링크가 생기고, null 이면 아무것도 렌더하지 않는다.
   *
   * ⚠️ **자문업 신고·등록이 실제로 끝난 뒤에만 채운다.**
   * 등록 전에 켜면 이 커뮤니티가 미등록 자문 서비스를 광고하는 모양이
   * 되어, 규제와 무관해야 할 커뮤니티까지 규제 대상으로 끌고 들어간다
   * (PRD §3.2 I-1 · ADVISORY_TRACK_MOVED.md §2). 스위치 하나에
   * 커뮤니티 트랙의 안전성이 걸려 있다.
   */
  advisorySiteUrl: null as string | null,
} as const;

/** 미확정 값의 화면 표기 규칙 (PRD §3.6) */
export const PLACEHOLDER = {
  pending: "설립 절차 진행 중",
  notApplicable: "해당 없음 (미신고)",
} as const;

export function displayServiceName(): string {
  return COMPANY.isTentativeName
    ? `(가칭) ${COMPANY.serviceName}`
    : COMPANY.serviceName;
}

/**
 * null 이면 임시 표기를 돌려준다.
 * 컴포넌트에서 null 분기를 하지 않게 하려는 헬퍼다 —
 * COMPANY.legalName 을 직접 읽지 말고 항상 이 함수를 쓴다.
 */
export function companyField(
  key: "legalName" | "ceo" | "bizRegNo" | "address",
): string {
  return COMPANY[key] ?? PLACEHOLDER.pending;
}

export function advisoryRegDisplay(): string {
  return COMPANY.advisory === "none"
    ? PLACEHOLDER.notApplicable
    : (COMPANY.advisoryRegNo ?? PLACEHOLDER.pending);
}

export const isPreIncorporation = () =>
  COMPANY.incorporation === "pre_incorporation";
