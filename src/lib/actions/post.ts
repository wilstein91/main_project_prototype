"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, getSessionProfile } from "@/lib/supabase/server";
import { idSchema, postSchema, postUpdateSchema } from "@/lib/validations/schemas";
import { fail, NOT_CONFIGURED_MESSAGE, fromSupabase, fromZod, type ActionState } from "./result";

const NOT_CONFIGURED = fail(NOT_CONFIGURED_MESSAGE);

export async function createPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await createClient();
  const profile = await getSessionProfile();
  if (!profile) return fail("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");

  const isAdmin = profile.role === "admin";

  // 카테고리 쓰기 권한과 고정 권한은 posts_insert 정책이 최종 판정한다.
  // 여기서 미리 막는 것은 사용자에게 명확한 메시지를 주기 위한 것이다.
  const { data: category } = await supabase
    .from("categories")
    .select("id, slug, name, write_role")
    .eq("id", parsed.data.categoryId)
    .maybeSingle();

  if (!category) return fail("존재하지 않는 카테고리입니다.");
  if (category.write_role === "admin" && !isAdmin) {
    return fail(`${category.name} 게시판은 운영자만 글을 쓸 수 있습니다.`);
  }

  const { data: inserted, error } = await supabase
    .from("posts")
    .insert({
      category_id: category.id,
      author_id: profile.id,
      title: parsed.data.title,
      content: parsed.data.content,
      // 고정은 관리자만. 일반 회원이 폼을 조작해도 RLS 가 거부한다.
      is_pinned: isAdmin ? parsed.data.isPinned : false,
    })
    .select("id")
    .single();

  if (error) return fail(fromSupabase(error));

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
  const profile = await getSessionProfile();
  if (!profile) return fail("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");

  const isAdmin = profile.role === "admin";
  const now = new Date().toISOString();

  const patch: {
    title: string;
    content: string;
    updated_at: string;
    edited_at: string;
    is_pinned?: boolean;
  } = {
    title: parsed.data.title,
    content: parsed.data.content,
    updated_at: now,
    edited_at: now,
  };
  // 관리자가 아니면 is_pinned 를 아예 보내지 않는다 — 기존 값이 유지된다
  if (isAdmin) patch.is_pinned = parsed.data.isPinned;

  const { data: updated, error } = await supabase
    .from("posts")
    .update(patch)
    .eq("id", parsed.data.postId)
    .select("id, category:categories!posts_category_id_fkey ( slug )")
    .single();

  if (error) return fail(fromSupabase(error));

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

  const slug = (post as unknown as { category: { slug: string } }).category.slug;

  // UPDATE 가 아니라 함수로 지운다. 이유는 0005 마이그레이션 주석에 있다 —
  // 요약하면 PostgREST 의 RETURNING 에 SELECT 정책이 걸려 회원 본인의
  // 소프트 삭제가 42501 로 막혔다.
  const { error } = await supabase.rpc("soft_delete_post", {
    p_post_id: postId,
  });

  if (error) {
    // 조용히 return 하면 버튼이 고장난 것과 구별되지 않는다. 실제로 이
    // 버그를 몇 주 동안 못 본 이유가 여기 있었다.
    redirect(`/c/${slug}/${postId}?error=delete`);
  }

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

  revalidatePath("/");
  revalidatePath(`/c/${slug}`);
  redirect(`/c/${slug}`);
}

// ─────────────────────────────────────────────────────────────
// 조회수 (F-208)
//
// 쿠키에 최근 본 글 id 를 기록해 같은 방문자의 재조회를 걸러낸다.
// 새로고침마다 증가하던 문제를 막는다.
//
// 쿠키를 쓰는 이유: 서버 컴포넌트에서는 쿠키를 쓸 수 없어서 조회수 증가를
// 서버 렌더 중에 하면 중복 방지 상태를 저장할 곳이 없다. Server Action 은
// 쿠키를 쓸 수 있으므로, 클라이언트에서 한 번 호출하는 형태로 옮겼다.
// sessionStorage 보다 넓게 막힌다 (탭을 닫아도, 여러 탭에서도 유지).
//
// 정확한 통계는 아니다 — 쿠키를 지우면 다시 증가한다. 정확도가 필요해지면
// post_views 테이블로 옮긴다 (TECH_SPEC §9.2 / TI-1).
// ─────────────────────────────────────────────────────────────

const VIEW_COOKIE = "viewed_posts";
/** 쿠키가 무한히 커지지 않도록 최근 것만 남긴다 */
const VIEW_COOKIE_MAX = 80;
const VIEW_COOKIE_MAX_AGE = 60 * 60 * 24; // 1일

export async function recordViewAction(postId: number): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const parsed = idSchema.safeParse(postId);
  if (!parsed.success) return;
  const id = parsed.data;

  const jar = await cookies();
  const seen = (jar.get(VIEW_COOKIE)?.value ?? "")
    .split(".")
    .filter((v) => /^\d+$/.test(v));

  if (seen.includes(String(id))) return; // 이미 센 방문

  const supabase = await createClient();
  // 실패해도 페이지가 깨지지 않도록 오류를 던지지 않는다
  const { error } = await supabase.rpc("increment_view_count", {
    p_post_id: id,
  });
  if (error) return;

  const next = [String(id), ...seen.filter((v) => v !== String(id))].slice(
    0,
    VIEW_COOKIE_MAX,
  );

  jar.set(VIEW_COOKIE, next.join("."), {
    maxAge: VIEW_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}
