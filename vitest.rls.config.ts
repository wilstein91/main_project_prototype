import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * RLS 통합 테스트 — 실제 Supabase 프로젝트를 상대로 돈다.
 *
 * 필요한 환경변수 (.env.local):
 *   SUPABASE_URL
 *   SUPABASE_PUBLISHABLE_KEY
 *   TEST_MEMBER_EMAIL      일반 회원 계정 (supabase/create_test_member.sql)
 *   TEST_MEMBER_PASSWORD
 *
 * 값이 없으면 테스트를 건너뛴다 — 통과로 위장하지 않고 skip 으로 표시된다.
 * 네트워크를 타므로 타임아웃을 넉넉히 둔다.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/rls/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // 같은 계정으로 쓰기를 주고받으므로 순차 실행한다
    fileParallelism: false,
    sequence: { concurrent: false },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
