import type { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Server Action 공통 반환 형태 — TECH_SPEC §6
//
// 예외를 던지지 않는다. 폼에 표시할 수 있는 값으로 돌려준다.
// 던지면 error.tsx 가 잡아 화면 전체가 오류로 바뀌는데,
// 입력 실수 하나로 그렇게 되면 안 된다.
// ─────────────────────────────────────────────────────────────

export type FieldErrors = Record<string, string[]>;

export interface ActionState {
  ok: boolean;
  /** 폼 상단에 띄울 메시지 */
  message?: string;
  /** 필드별 오류 */
  fieldErrors?: FieldErrors;
}

export const idle: ActionState = { ok: false };

export const fail = (message: string, fieldErrors?: FieldErrors): ActionState => ({
  ok: false,
  message,
  fieldErrors,
});

export const succeed = (message?: string): ActionState => ({
  ok: true,
  message,
});

/** zod 오류를 필드별 메시지로 변환 */
export function fromZod(error: z.ZodError): ActionState {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  const first = Object.values(fieldErrors)[0]?.[0];
  return { ok: false, message: first ?? "입력값을 확인하세요.", fieldErrors };
}

/**
 * Supabase 오류 메시지를 사용자 언어로 바꾼다.
 * 원문은 영어이고 내부 구조를 노출하기도 한다.
 */
export function fromSupabase(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (m.includes("email not confirmed")) {
    return "이메일 인증이 완료되지 않았습니다. 받은 메일의 링크를 확인해 주세요.";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "이미 가입된 이메일입니다.";
  }
  if (m.includes("profiles_nickname_key") || m.includes("duplicate key")) {
    return "이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.";
  }
  if (m.includes("password") && m.includes("weak")) {
    return "이미 유출된 적이 있는 비밀번호입니다. 다른 비밀번호를 사용해 주세요.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (m.includes("대댓글은 1단계")) {
    return "대댓글은 1단계까지만 작성할 수 있습니다.";
  }
  if (m.includes("row-level security") || m.includes("violates row-level")) {
    return "권한이 없습니다.";
  }
  return "처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}
