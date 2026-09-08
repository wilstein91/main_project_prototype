import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import {
  assertSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "./config";

/**
 * 서버 컴포넌트 / Server Action 용 클라이언트.
 *
 * Next 16 에서 cookies() 는 완전 비동기다. 요청마다 새로 만들며
 * 절대 모듈 스코프에 캐시하지 않는다 (요청 간 세션이 섞인다).
 *
 * 서버 컴포넌트에서는 쿠키를 쓸 수 없으므로 setAll 이 던지는 예외를
 * 삼킨다. 토큰 갱신은 proxy.ts 가 담당한다.
 */
export async function createClient() {
  assertSupabaseConfigured();
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // 서버 컴포넌트에서 호출된 경우. proxy.ts 가 갱신을 처리한다.
        }
      },
    },
  });
}

/** 로그인한 사용자. 비로그인이면 null. */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export interface SessionProfile {
  id: string;
  nickname: string;
  role: "user" | "admin";
  status: "active" | "withdrawn";
  nickname_changed_at: string | null;
}

/**
 * 로그인한 사용자의 프로필. 화면에서 닉네임·권한을 쓰려면 이걸 부른다.
 *
 * 권한 판정은 최종적으로 DB 의 RLS 가 한다. 이 값은 UI 표시용이며,
 * 이것만으로 접근을 허용하지 않는다 (TECH_SPEC §2.1).
 */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, nickname, role, status, nickname_changed_at")
    .eq("id", user.id)
    .single();

  return (data as SessionProfile | null) ?? null;
}
