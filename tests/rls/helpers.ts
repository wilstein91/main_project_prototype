import { readFileSync } from "node:fs";

/**
 * RLS 통합 테스트 공용 헬퍼.
 *
 * supabase-js 를 쓰지 않고 PostgREST 를 직접 호출한다. 이유:
 * 클라이언트 래퍼가 오류를 감싸면 "정책이 막았는지" 와 "요청이 잘못됐는지"
 * 를 구분하기 어렵다. HTTP 상태와 Postgres 오류 코드를 그대로 보고 싶다.
 */

function loadEnvLocal(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 1) continue;
      out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  } catch {
    // 파일이 없으면 process.env 만 쓴다 (CI)
  }
  return out;
}

const fileEnv = loadEnvLocal();
const env = (k: string) => process.env[k]?.trim() || fileEnv[k] || "";

export const SUPABASE_URL = env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
export const ANON_KEY =
  env("SUPABASE_PUBLISHABLE_KEY") || env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
export const MEMBER_EMAIL = env("TEST_MEMBER_EMAIL");
export const MEMBER_PASSWORD = env("TEST_MEMBER_PASSWORD");

/** 설정이 없으면 테스트를 건너뛴다 — 통과로 위장하지 않는다 */
export const hasConfig = Boolean(SUPABASE_URL && ANON_KEY);
export const hasMember = Boolean(hasConfig && MEMBER_EMAIL && MEMBER_PASSWORD);

export interface Result<T = unknown> {
  status: number;
  /** Postgres SQLSTATE (42501 = RLS 위반) 또는 PostgREST 코드 */
  code?: string;
  body: T;
}

async function call<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<Result<T>> {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      // 쓰기 결과를 그대로 받아 '0행 수정' 과 '성공' 을 구분한다
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  const code =
    body && typeof body === "object" && "code" in body
      ? String((body as { code: unknown }).code)
      : undefined;
  return { status: res.status, code, body: body as T };
}

export const rest = {
  select: <T>(token: string, q: string) => call<T>(`/rest/v1/${q}`, token),
  insert: <T>(token: string, table: string, row: unknown, q = "") =>
    call<T>(`/rest/v1/${table}${q}`, token, {
      method: "POST",
      body: JSON.stringify(row),
    }),
  patch: <T>(token: string, table: string, filter: string, patch: unknown) =>
    call<T>(`/rest/v1/${table}?${filter}`, token, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  rpc: <T>(token: string, fn: string, args: unknown = {}) =>
    call<T>(`/rest/v1/rpc/${fn}`, token, {
      method: "POST",
      body: JSON.stringify(args),
    }),
};

/** 로그인해서 액세스 토큰과 user id 를 얻는다 */
export async function signIn(email: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`로그인 실패 (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as {
    access_token: string;
    user: { id: string };
  };
  return { token: json.access_token, userId: json.user.id };
}

/** 비로그인(anon) 은 공개 키를 그대로 Bearer 로 쓴다 */
export const ANON_TOKEN = ANON_KEY;

export const isRlsViolation = (r: Result) =>
  r.code === "42501" || r.status === 401 || r.status === 403;

/** PATCH 가 0행에 영향 — 정책이 조용히 걸러낸 경우 */
export const affectedNoRows = (r: Result<unknown[]>) =>
  r.status === 200 && Array.isArray(r.body) && r.body.length === 0;
