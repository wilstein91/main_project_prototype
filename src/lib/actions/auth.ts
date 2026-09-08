"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SITE_URL } from "@/lib/site";
import {
  resetRequestSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/validations/schemas";
import { fail, fromSupabase, fromZod, succeed, type ActionState } from "./result";

const NOT_CONFIGURED = fail(
  "아직 데이터베이스가 연결되지 않았습니다. .env.local 에 Supabase 키를 넣어주세요.",
);

/** 리다이렉트 대상은 반드시 내부 경로여야 한다 (오픈 리다이렉트 방지) */
function safeRedirect(target: string | undefined): string {
  if (!target) return "/";
  if (!target.startsWith("/") || target.startsWith("//")) return "/";
  return target;
}

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const { email, password, nickname } = parsed.data;

  const supabase = await createClient();

  // 사전 확인. 최종 보증은 profiles.nickname UNIQUE 제약이다 (TECH_SPEC §5.1).
  const { data: available, error: rpcError } = await supabase.rpc(
    "is_nickname_available",
    { p_nickname: nickname },
  );
  if (!rpcError && available === false) {
    return fail("이미 사용 중인 닉네임입니다.", {
      nickname: ["이미 사용 중인 닉네임입니다."],
    });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // handle_new_user 트리거가 이 값으로 profiles 행을 만든다
      data: { nickname },
      emailRedirectTo: `${SITE_URL}/auth/confirm`,
    },
  });

  if (error) return fail(fromSupabase(error));

  /**
   * 이미 가입된 이메일이면 Supabase 는 오류를 내지 않는다 — 계정 존재
   * 여부를 노출하지 않으려는 설계다. 대신 user.identities 가 빈 배열로
   * 온다. 이 경우 메일도 발송되지 않으므로, 안내하지 않으면 사용자는
   * "메일이 안 온다" 는 상태에 갇힌다.
   */
  if (data.user && data.user.identities?.length === 0) {
    return fail(
      "이미 가입된 이메일입니다. 로그인하거나, 비밀번호를 잊으셨다면 재설정을 이용해 주세요.",
      { email: ["이미 가입된 이메일입니다."] },
    );
  }

  return succeed(
    "인증 메일을 보냈습니다. 메일의 링크를 눌러 가입을 완료해 주세요.",
  );
}

/**
 * 인증 메일 재발송 (F-101 보조)
 *
 * 아직 인증하지 않은 계정에만 동작한다. 이미 인증된 계정이나 없는
 * 계정에는 발송되지 않으며, 그 사실을 응답으로 구분해 주지 않는다.
 *
 * 기본 메일러의 발송 한도가 매우 낮아 여기서 한도 초과가 자주 나온다.
 * fromSupabase 가 그 상황을 사용자 언어로 설명한다.
 */
export async function resendSignUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = resetRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${SITE_URL}/auth/confirm` },
  });

  if (error) return fail(fromSupabase(error));

  return succeed(
    "아직 인증하지 않은 계정이라면 메일을 다시 보냈습니다. 스팸함도 확인해 주세요.",
  );
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return fail(fromSupabase(error));

  revalidatePath("/", "layout");
  redirect(safeRedirect(parsed.data.redirect));
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = resetRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE_URL}/auth/confirm?next=/settings%3Freset%3D1`,
  });

  // 계정 존재 여부를 노출하지 않는다 — 성공·실패 모두 같은 응답 (TECH_SPEC §6).
  return succeed(
    "해당 이메일로 가입된 계정이 있다면 재설정 링크를 보냈습니다.",
  );
}

export async function updatePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("로그인이 필요합니다.");

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return fail(fromSupabase(error));

  return succeed("비밀번호를 변경했습니다.");
}
