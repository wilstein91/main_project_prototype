"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, getSessionProfile } from "@/lib/supabase/server";
import { idSchema, postSchema, postUpdateSchema } from "@/lib/validations/schemas";
import { fail, fromSupabase, fromZod, type ActionState } from "./result";

const NOT_CONFIGURED = fail(
  "아직 데이터베이스가 연결되지 않았습니다. .env.local 에 Supabase 키를 넣어주세요.",
);

export async function createPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("로그인이 필요합니다.");

  // 공지 카테고리 쓰기 제한은 posts_insert 정책이 최종 판정한다.
  // 여기서 미리 막는 것은 사용자에게 명확한 메시지를 주기 위한 것이다.
  const { data: category } = await supabase
    .from("categories")
    .select("id, slug, write_role")
    .eq("id", parsed.data.categoryId)
    .maybeSingle();

  if (!category) return fail("존재하지 않는 카테고리입니다.");

  const { data: inserted, error } = await supabase
    .from("posts")
    .insert({
      category_id: category.id,
      author_id: user.id,
      title: parsed.data.title,
      content: parsed.data.content,
    })
    .select("id")
    .single();

  if (error) return fail(fromSupabase(error.message));

  revalidatePath("/");
  revalidatePath(`/c/${category.slug}`);
  redirect(`/c/${category.slug}/${inserted.id}`);
}

export async function updatePostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = postUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("로그인이 필요합니다.");

  const now = new Date().toISOString();
  const { data: updated, error } = await supabase
    .from("posts")
    .update({
      title: parsed.data.title,
      content: parsed.data.content,
      updated_at: now,
      edited_at: now,
    })
    .eq("id", parsed.data.postId)
    .select("id, category:categories!posts_category_id_fkey ( slug )")
    .single();

  if (error) return fail(fromSupabase(error.message));

  const slug = (updated as unknown as { category: { slug: string } }).category
    .slug;

  revalidatePath("/");
  revalidatePath(`/c/${slug}`);
  revalidatePath(`/c/${slug}/${parsed.data.postId}`);
  redirect(`/c/${slug}/${parsed.data.postId}`);
}

/**
 * 소프트 삭제 — is_deleted = true (TECH_SPEC §9.3).
 * 관리자가 타인 글을 지우면 같은 흐름에서 audit_logs 에 기록한다 (PRD D-4).
 */
export async function deletePostAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const parsedId = idSchema.safeParse(formData.get("postId"));
  if (!parsedId.success) return;
  const postId = parsedId.data;

  const supabase = await createClient();
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const { data: post } = await supabase
    .from("posts")
    .select("id, author_id, category:categories!posts_category_id_fkey ( slug )")
    .eq("id", postId)
    .maybeSingle();

  if (!post) return;

  const { error } = await supabase
    .from("posts")
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) return;

  const isOthers = post.author_id !== profile.id;
  if (profile.role === "admin" && isOthers) {
    const reason = formData.get("reason");
    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      action: "delete_post",
      target_type: "post",
      target_id: String(postId),
      reason: typeof reason === "string" && reason ? reason : null,
    });
  }

  const slug = (post as unknown as { category: { slug: string } }).category.slug;
  revalidatePath("/");
  revalidatePath(`/c/${slug}`);
  redirect(`/c/${slug}`);
}

/** 조회수 — 실패해도 상세 페이지가 깨지지 않도록 조용히 무시한다 */
export async function incrementViewAction(postId: number): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  await supabase.rpc("increment_view_count", { p_post_id: postId });
}
