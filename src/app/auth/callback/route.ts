import type { NextRequest } from "next/server";
import { handleAuthReturn } from "@/lib/auth/return-handler";

/**
 * OAuth 콜백 (Phase 4 카카오 로그인 대비) + 기존 이메일 링크 호환.
 *
 * 처리 내용은 /auth/confirm 과 동일하다. 경로를 둘 다 두는 이유는
 * 이미 발송된 메일과 대시보드 설정이 어느 쪽을 가리키든 동작하게
 * 하려는 것이다.
 *
 * 이 경로도 Supabase Redirect URL 허용 목록에 등록해야 한다
 * (TECH_SPEC §10.6).
 */
export async function GET(request: NextRequest) {
  return handleAuthReturn(request, "auth/callback");
}
