import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * 인증 링크가 앱으로 돌아왔을 때의 공통 처리.
 *
 * /auth/confirm 과 /auth/callback 이 같은 이 함수를 쓴다. 링크가 어느
 * 경로로 오든, 어떤 형태로 오든 처리되게 하려는 것이다.
 *
 * 두 가지 형태를 모두 받는다.
 *
 * 1) token_hash + type  → verifyOtp
 *    이메일 템플릿을 {{ .TokenHash }} 형태로 바꿨을 때. 쿠키에 의존하지
 *    않으므로 다른 브라우저에서 링크를 열어도 동작한다. 권장 방식이다.
 *
 * 2) code               → exchangeCodeForSession
 *    OAuth(소셜 로그인)와, 기본 템플릿 + PKCE 조합. 발급 시점에 심어둔
 *    code verifier 쿠키가 필요해서, 링크를 다른 브라우저에서 열면 실패한다.
 *
 * 실패 시 사유를 reason 파라미터로 넘겨 /login 에서 사용자에게 설명한다.
 */

const ALLOWED_TYPES: readonly EmailOtpType[] = [
  "signup",
  "email",
  "email_change",
  "recovery",
  "magiclink",
  "invite",
];

/** 내부 경로만 허용 (오픈 리다이렉트 방지) */
function safePath(value: string | null, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

function failure(origin: string, reason: string) {
  return NextResponse.redirect(
    `${origin}/login?error=auth_callback&reason=${reason}`,
  );
}

/** recovery 는 세션이 생긴 직후 새 비밀번호를 받아야 한다 */
function successPath(
  searchParams: URLSearchParams,
  type: EmailOtpType | null,
): string {
  const fallback = type === "recovery" ? "/settings?reset=1" : "/";
  return safePath(searchParams.get("next"), fallback);
}

export async function handleAuthReturn(
  request: NextRequest,
  routeLabel: string,
): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;

  if (!isSupabaseConfigured()) return failure(origin, "not_configured");

  // Supabase 가 오류를 쿼리로 실어 보내는 경우 먼저 확인한다
  const upstream =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (upstream) {
    console.error(`[${routeLabel}] 업스트림 오류:`, upstream);
    return failure(origin, "upstream");
  }

  const supabase = await createClient();

  // ── 1) token_hash 방식 ──────────────────────────────────────
  const tokenHash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");

  if (tokenHash) {
    if (!rawType || !ALLOWED_TYPES.includes(rawType as EmailOtpType)) {
      return failure(origin, "bad_type");
    }
    const type = rawType as EmailOtpType;
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) {
      // 링크 만료·재사용이 대부분이다
      console.error(`[${routeLabel}] verifyOtp 실패:`, type, error.message);
      return failure(origin, "verify_failed");
    }
    return NextResponse.redirect(`${origin}${successPath(searchParams, type)}`);
  }

  // ── 2) code 방식 ────────────────────────────────────────────
  const code = searchParams.get("code");
  if (!code) return failure(origin, "no_token");

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error(`[${routeLabel}] 코드 교환 실패:`, error.message);
    return failure(origin, "exchange_failed");
  }

  const type = ALLOWED_TYPES.includes(rawType as EmailOtpType)
    ? (rawType as EmailOtpType)
    : null;
  return NextResponse.redirect(`${origin}${successPath(searchParams, type)}`);
}
