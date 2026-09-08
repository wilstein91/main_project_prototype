"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, getSessionProfile } from "@/lib/supabase/server";
import {
  commentSchema,
  commentUpdateSchema,
  idSchema,
} from "@/lib/validations/schemas";
import { fail, fromSupabase, fromZod, succeed, type ActionState } from "./result";

const NOT_CONFIGURED = fail(
  "아직 데이터베이스가 연결되지 않았습니다. .env.local 에 Supabase 키를 넣어주세요.",
);

/** 댓글이 달린 글의 상세 경로를 알아내 캐시를 무효화한다 */
async function revalidatePost(postId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id, category:categories!posts_category_id_fkey ( slug )")
    .eq("id", postId)
    .maybeSingle();

  if (!data) return;
  const slug = (data as unknown as { category: { slug: string } }).category.slug;
  revalidatePath(`/c/${slug}/${postId}`);
  revalidatePath(`/c/${slug}`);
  revalidatePath("/");
}

export async function createCommentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const raw = Object.fromEntries(formData);
  // 빈 문자열로 넘어온 parentId 는 최상위 댓글을 뜻한다
  if (raw.parentId === "") delete raw.parentId;

  const parsed = commentSchema.safeParse(raw);
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("로그인이 필요합니다.");

  // 깊이 제한은 enforce_comment_depth 트리거가 최종 판정한다.
  const { error } = await supabase.from("comments").insert({
    post_id: parsed.data.postId,
    author_id: user.id,
    parent_id: parsed.data.parentId ?? null,
    content: parsed.data.content,
  });

  if (error) return fail(fromSupabase(error.message));

  await revalidatePost(parsed.data.postId);
  return succeed();
}

export async function updateCommentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = commentUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .update({
      content: parsed.data.content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.commentId)
    .select("post_id")
    .single();

  if (error) return fail(fromSupabase(error.message));

  await revalidatePost(data.post_id);
  return succeed();
}

/**
 * 소프트 삭제 — 자리를 남긴다. 지우면 대댓글 트리가 무너진다
 * (TECH_SPEC §9.3).
 */
export async function deleteCommentAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const parsedId = idSchema.safeParse(formData.get("commentId"));
  if (!parsedId.success) return;
  const commentId = parsedId.data;

  const supabase = await createClient();
  const profile = await getSessionProfile();
  if (!profile) return;

  const { data: comment } = await supabase
    .from("comments")
    .select("id, post_id, author_id")
    .eq("id", commentId)
    .maybeSingle();

  if (!comment) return;

  const { error } = await supabase
    .from("comments")
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) return;

  if (profile.role === "admin" && comment.author_id !== profile.id) {
    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      action: "delete_comment",
      target_type: "comment",
      target_id: String(commentId),
      reason: null,
    });
  }

  await revalidatePost(comment.post_id);
}
