// ─────────────────────────────────────────────────────────────
// Supabase 연결 설정
//
// 키가 아직 없는 동안에도 앱이 돌아가야 하므로, 설정 여부를 한 곳에서
// 판정하고 데이터 계층이 이를 보고 시드/실DB 를 고른다
// (src/lib/data/queries.ts).
//
// 여기에 노출되는 것은 공개 키(publishable)뿐이다. secret 키는
// 이 프로젝트에서 사용하지 않는다 — 모든 접근은 사용자 JWT 로
// RLS 판정을 받는다 (TECH_SPEC §2.1).
// ─────────────────────────────────────────────────────────────

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * 공개 키.
 *
 * Supabase 가 키 체계를 바꿨다 — `sb_publishable_...` 가 기존 `anon`
 * JWT 키를 대체하며, `anon` 은 2026년 말 폐기 예정이다. 권한 수준은
 * 동일하므로 RLS 동작은 같고, 값만 바꿔 끼우면 된다.
 *
 * 새 이름을 우선 읽고, 기존 프로젝트를 위해 옛 이름을 폴백으로 둔다.
 * 두 값 모두 클라이언트 번들에 포함되므로 공개된다고 간주한다.
 */
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/** 두 값이 모두 채워졌을 때만 실 DB 를 쓴다 */
export const isSupabaseConfigured = (): boolean =>
  SUPABASE_URL.length > 0 && SUPABASE_PUBLISHABLE_KEY.length > 0;

/**
 * 설정되지 않은 상태에서 클라이언트를 만들려 하면 즉시 실패시킨다.
 * 빈 문자열로 만들어진 클라이언트는 런타임에 알 수 없는 오류를 낸다.
 */
export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase 환경변수가 없습니다. .env.local.example 을 .env.local 로 복사한 뒤 " +
        "NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 채우세요. " +
        "절차는 SUPABASE_SETUP.md 를 참고하세요.",
    );
  }
}
