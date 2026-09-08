import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next 16 규약 — 파일명은 proxy.ts, 내보내는 함수명도 proxy 다.
 * (15 의 middleware.ts / middleware 는 폐기됨)
 *
 * 런타임은 nodejs 로 고정되며 설정할 수 없다.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /**
   * 정적 자원과 이미지 최적화 요청은 건너뛴다.
   * 나머지 모든 경로에서 세션을 갱신해야 토큰이 만료되지 않는다.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
