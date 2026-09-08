"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import {
  assertSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "./config";

/**
 * 브라우저 클라이언트.
 *
 * 데이터 변경은 Server Action 으로만 한다 (TECH_SPEC §2.1). 따라서 이
 * 클라이언트는 인증 상태 구독처럼 클라이언트에서만 가능한 일에 쓴다.
 */
export function createClient() {
  assertSupabaseConfigured();
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
