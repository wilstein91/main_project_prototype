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

/**
 * Supabase 가 아직 연결되지 않은 상태(씨드 모드)에서 폼을 제출했을 때.
 * 개발자에게 하는 말이므로 개발 중에만 보인다 — 네 곳에서 같은 문장을
 * 쓰고 있었기에 여기 한 곳으로 모았다.
 */
export const NOT_CONFIGURED_MESSAGE =
  "아직 데이터베이스가 연결되지 않았습니다. .env.local 에 Supabase 키를 넣어 주세요.";

export const fail = (
  message: string,
  fieldErrors?: FieldErrors,
): ActionState => ({ ok: false, message, fieldErrors });

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
  return { ok: false, message: first ?? "입력한 내용을 확인해 주세요.", fieldErrors };
}

/**
 * Supabase 오류를 사용자 언어로 바꾼다.
 *
 * 문자열이 아니라 **오류 코드로 판정**한다 — 메시지 원문은 버전에 따라
 * 바뀌지만 코드는 안정적이다 (AuthError.code / PostgrestError.code).
 * 코드가 없는 경우에만 문자열 패턴으로 넘어간다.
 */
interface SupabaseErrorish {
  code?: string | null;
  message: string;
}

/** 가입·재설정 두 곳에서 같은 문장을 쓴다 */
const EMAIL_TAKEN =
  "이미 가입된 이메일입니다. 로그인하거나, 비밀번호를 잊으셨다면 재설정을 이용해 주세요.";

/** 오류 코드 → 한국어 메시지 */
const BY_CODE: Record<string, string> = {
  // ── 인증
  invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
  email_not_confirmed:
    "이메일 인증이 완료되지 않았습니다. 받은 메일의 링크를 눌러 주세요.",
  email_exists: EMAIL_TAKEN,
  user_already_exists: EMAIL_TAKEN,
  weak_password:
    "이미 유출된 적이 있거나 너무 단순한 비밀번호입니다. 다른 비밀번호를 사용해 주세요.",
  same_password: "현재 비밀번호와 같습니다. 다른 비밀번호를 입력해 주세요.",
  otp_expired:
    "인증 링크가 만료되었거나 이미 사용되었습니다. 메일을 다시 요청해 주세요.",
  signup_disabled: "현재 신규 가입이 중단되어 있습니다.",
  user_banned: "이용이 제한된 계정입니다.",
  email_address_invalid: "이메일 주소 형식이 올바르지 않습니다.",
  email_provider_disabled: "이메일 로그인이 비활성화되어 있습니다.",
  captcha_failed: "사람 확인을 마치지 못했습니다. 다시 시도해 주세요.",
  bad_code_verifier:
    "인증을 시작한 브라우저와 링크를 연 브라우저가 다릅니다. 같은 브라우저에서 다시 시도해 주세요.",

  // ── 발송 한도 — 지금 가장 자주 만나는 오류
  // 사용자에게 SMTP 설정을 안내하지 않는다 — 회원이 할 수 있는 일이
  // 아니다. 운영자가 봐야 하는 내용은 fromSupabase 가 서버 로그로 남긴다.
  over_email_send_rate_limit:
    "메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.",
  over_request_rate_limit:
    "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",

  // ── DB (Postgres SQLSTATE)
  "42501": "이 작업을 수행할 권한이 없습니다.",
  "23505": "이미 사용 중인 값입니다.",
  "23503": "존재하지 않는 대상입니다.",
  "23514": "입력값이 허용 범위를 벗어났습니다.",
};

/** 코드가 없을 때만 쓰는 문자열 패턴 */
const BY_TEXT: [RegExp, string][] = [
  [/invalid login credentials/i, "이메일 또는 비밀번호가 올바르지 않습니다."],
  [
    /email not confirmed/i,
    "이메일 인증이 완료되지 않았습니다. 받은 메일의 링크를 눌러 주세요.",
  ],
  [/already (been )?registered|already exists/i, EMAIL_TAKEN],
  [
    /you can only request this after (\d+) seconds?/i,
    "너무 자주 요청했습니다. 잠시 후 다시 시도해 주세요.",
  ],
  [
    /email rate limit exceeded/i,
    "메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.",
  ],
  [/rate limit|too many requests/i, "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."],
  [/profiles_nickname_key/i, "이미 사용 중인 닉네임입니다."],
  [/대댓글은 1단계/, "대댓글은 1단계까지만 작성할 수 있습니다."],
  [/row-level security/i, "이 작업을 수행할 권한이 없습니다."],
];

export function fromSupabase(error: SupabaseErrorish | string): string {
  const code = typeof error === "string" ? undefined : error.code ?? undefined;
  const message = typeof error === "string" ? error : error.message;

  if (code && BY_CODE[code]) return BY_CODE[code];

  for (const [re, text] of BY_TEXT) {
    if (re.test(message)) return text;
  }

  // 원인을 못 찾으면 서버 로그에 원문을 남긴다. 사용자에게는 노출하지 않는다.
  console.error("[supabase] 미분류 오류:", code ?? "(no code)", message);
  return "처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}
