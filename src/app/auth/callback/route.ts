import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * 인증 콜백 — 이메일 인증 링크와 비밀번호 재설정 링크가 돌아오는 곳.
 *
 * 이 경로는 Supabase 대시보드의 Redirect URL 허용 목록에 등록되어야
 * 한다. 와일드카드를 쓰지 않는다 (TECH_SPEC §10.6).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // 오픈 리다이렉트 방지 — 내부 경로만 허용한다
  const target =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!isSupabaseConfigured() || !code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  return NextResponse.redirect(`${origin}${target}`);
}
