/**
 * 배포 주소 — 도메인 확정 후 NEXT_PUBLIC_SITE_URL 로 주입한다.
 * Supabase Site URL / Redirect URL 허용 목록과 반드시 일치시킬 것
 * (TECH_SPEC §10.6).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";
