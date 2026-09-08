import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { isSupabaseConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

/**
 * 세션 갱신 + 보호 경로 판정 — src/proxy.ts 에서 호출한다.
 *
 * Next 16 에서 `middleware` 규약은 `proxy` 로 바뀌었고 런타임은
 * nodejs 로 고정된다 (edge 불가).
 *
 * getAll / setAll 을 둘 다 구현해야 한다. 한쪽만 구현하면 임의 로그아웃,
 * 세션 조기 종료 같은 디버깅하기 어려운 인증 문제가 생긴다.
 */

/** 로그인이 필요한 경로 */
const PROTECTED = [/^\/write$/, /^\/settings$/, /^\/c\/[^/]+\/[^/]+\/edit$/];
/** 관리자만 접근하는 경로 — 서버 컴포넌트에서 role 을 다시 확인한다 */
const ADMIN_ONLY = [/^\/admin(\/|$)/];

const matches = (patterns: RegExp[], path: string) =>
  patterns.some((re) => re.test(path));

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // 키가 없으면 세션 개념이 없다. 보호 경로도 그대로 통과시켜
  // 형상 확인을 막지 않는다 (화면에 '개발 중' 안내가 떠 있다).
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() 를 호출해야 토큰이 갱신된다. getSession() 으로 대체하지 않는다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsAuth = matches(PROTECTED, path) || matches(ADMIN_ONLY, path);

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return response;
}
