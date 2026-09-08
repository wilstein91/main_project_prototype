// ─────────────────────────────────────────────────────────────
// Supabase 연결 설정
//
// 이 값들은 **서버에서만** 쓰인다. 모든 DB 접근이 Server Component 와
// Server Action 에서 일어나므로(TECH_SPEC §2.1) 브라우저 번들에 넣을
// 이유가 없다. 그래서 NEXT_PUBLIC_ 접두사를 쓰지 않는다.
//
// 접두사가 붙은 이름도 폴백으로 읽는다 — 기존에 그렇게 설정해 둔
// 환경이 깨지지 않게 하려는 것이다. 새로 설정할 때는 접두사 없는
// 이름을 쓴다.
//
// 나중에 실시간 기능(Phase 4 liveChat)처럼 브라우저가 직접 Supabase 에
// 붙어야 하는 것이 생기면, 그때 NEXT_PUBLIC_ 이름을 추가한다.
// ─────────────────────────────────────────────────────────────

function readEnv(...names: string[]): string {
  for (const n of names) {
    const v = process.env[n]?.trim();
    if (v) return v;
  }
  return "";
}

export const SUPABASE_URL = readEnv(
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
);

/**
 * 공개 키.
 *
 * Supabase 가 키 체계를 바꿨다 — `sb_publishable_...` 가 기존 `anon`
 * JWT 키를 대체하며, `anon` 은 2026년 말 폐기 예정이다. 권한 수준은
 * 동일하므로 RLS 동작은 같고 값만 바꿔 끼우면 된다.
 *
 * 이름은 '공개 키' 지만, 서버에서만 읽으므로 브라우저에는 노출되지
 * 않는다. 실제 접근 통제는 RLS 가 한다.
 */
export const SUPABASE_PUBLISHABLE_KEY = readEnv(
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
);

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
        "SUPABASE_URL 과 SUPABASE_PUBLISHABLE_KEY 를 채우세요. " +
        "절차는 SUPABASE_SETUP.md 를 참고하세요.",
    );
  }
}
