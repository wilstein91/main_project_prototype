/**
 * 배포 주소 — 도메인 확정 후 NEXT_PUBLIC_SITE_URL 로 주입한다.
 * Supabase Site URL / Redirect URL 허용 목록과 반드시 일치시킬 것
 * (TECH_SPEC §10.6).
 *
 * Vercel 에서는 VERCEL_PROJECT_PRODUCTION_URL 이 자동 주입되므로,
 * 도메인을 정하기 전에도 올바른 절대 주소가 만들어진다.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

/**
 * 검색엔진 색인 허용 여부.
 *
 * 기본값은 **차단**이다. 지금 사이트에는
 *   - 변호사 검토 전 법적 고지문 (PRD 부록 A)
 *   - 확정되지 않은 사업자 정보 (`설립 절차 진행 중`)
 *   - 가칭 서비스명
 * 이 들어 있어서, 색인되면 잘못된 내용이 검색 결과에 남는다. 한번 색인된
 * 페이지는 지워도 캐시에 남는다.
 *
 * 정식 오픈 시점에 배포 환경변수로 NEXT_PUBLIC_ALLOW_INDEXING=true 를
 * 넣어 연다. 코드 수정은 필요 없다.
 */
export const ALLOW_INDEXING =
  process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
