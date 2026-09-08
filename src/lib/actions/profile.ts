"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, getSessionProfile } from "@/lib/supabase/server";
import { updateNicknameSchema } from "@/lib/validations/schemas";
import {
  formatKstDate,
  nicknameChangeAvailableAt,
} from "@/lib/profile-rules";
import { fail, fromSupabase, fromZod, succeed, type ActionState } from "./result";

const NOT_CONFIGURED = fail(
  "아직 데이터베이스가 연결되지 않았습니다. .env.local 에 Supabase 키를 넣어주세요.",
);

export async function updateNicknameAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = updateNicknameSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const profile = await getSessionProfile();
  if (!profile) return fail("로그인이 필요합니다.");

  if (profile.nickname === parsed.data.nickname) {
    return fail("현재 닉네임과 같습니다.");
  }

  const blockedUntil = nicknameChangeAvailableAt(profile.nickname_changed_at);
  if (blockedUntil) {
    return fail(
      `닉네임은 ${formatKstDate(blockedUntil)} 이후에 다시 변경할 수 있습니다.`,
    );
  }

  const supabase = await createClient();
  const { data: available } = await supabase.rpc("is_nickname_available", {
    p_nickname: parsed.data.nickname,
  });
  if (available === false) {
    return fail("이미 사용 중인 닉네임입니다.", {
      nickname: ["이미 사용 중인 닉네임입니다."],
    });
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({
      nickname: parsed.data.nickname,
      nickname_changed_at: now,
      updated_at: now,
    })
    .eq("id", profile.id);

  if (error) return fail(fromSupabase(error.message));

  revalidatePath("/", "layout");
  return succeed("닉네임을 변경했습니다.");
}

/**
 * 회원 탈퇴 (F-107) — 계정을 비활성화하고 작성물은 남긴다.
 *
 * auth.users 행 삭제는 service_role 권한이 필요하므로 하지 않는다.
 * 대신 profiles.status 를 withdrawn 으로 바꾸면 조회 시
 * '탈퇴한 사용자'로 표기된다 (TECH_SPEC §9.3).
 * 실제 계정 삭제는 운영 절차로 처리한다.
 */
export async function withdrawAction(
  _prev: ActionState,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const profile = await getSessionProfile();
  if (!profile) return fail("로그인이 필요합니다.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status: "withdrawn", updated_at: new Date().toISOString() })
    .eq("id", profile.id);

  if (error) return fail(fromSupabase(error.message));

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return succeed("탈퇴 처리되었습니다.");
}
