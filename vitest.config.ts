import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * 테스트는 두 갈래다 (TECH_SPEC §12).
 *
 *   npm run test       단위 테스트만. DB 가 필요 없다
 *   npm run test:rls   실 DB 를 상대로 RLS 정책을 검증한다
 *
 * RLS 테스트를 분리한 이유: 네트워크와 실제 계정이 필요해서 느리고,
 * .env.local 이 없는 환경에서는 돌 수 없다. 단위 테스트는 어디서든 돈다.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tests/unit/**/*.test.ts"],
    exclude: ["node_modules", ".next", "tests/rls/**"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
