import type { NextRequest } from "next/server";
import { handleAuthReturn } from "@/lib/auth/return-handler";

/**
 * 이메일 링크 확인 — 가입 인증 / 비밀번호 재설정 (F-101 / F-104)
 *
 * 이메일 템플릿이 {{ .TokenHash }} 형태를 가리키게 하고 이 경로로 받는다.
 * 쿠키(code verifier)에 의존하지 않아 다른 브라우저에서 링크를 열어도
 * 동작한다 — 기본 템플릿의 {{ .ConfirmationURL }} 방식이 실패하는 주된
 * 원인이 그 쿠키 의존이다.
 *
 * 템플릿 변경 방법은 SUPABASE_SETUP.md §4.6 참고.
 * 이 경로도 Supabase Redirect URL 허용 목록에 등록해야 한다.
 */
export async function GET(request: NextRequest) {
  return handleAuthReturn(request, "auth/confirm");
}
