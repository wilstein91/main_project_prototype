import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionProfile, type SessionProfile } from "@/lib/supabase/server";

/**
 * 화면에서 쓰는 세션 조회 진입점.
 *
 * Supabase 키가 없으면 항상 비로그인으로 취급한다 — 시드 모드에서
 * 로그인 개념이 없기 때문이다. 덕분에 모든 페이지가 키 유무와 무관하게
 * 렌더링된다.
 *
 * 이 값은 UI 표시용이다. 접근 허용의 근거로 쓰지 않는다 — 최종 판정은
 * RLS 가 한다 (TECH_SPEC §2.1).
 */
export async function getViewer(): Promise<SessionProfile | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    return await getSessionProfile();
  } catch {
    // 키가 잘못되었거나 네트워크 문제. 비로그인으로 다루고 화면은 살린다.
    return null;
  }
}

export type { SessionProfile };
