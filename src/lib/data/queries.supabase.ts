// ─────────────────────────────────────────────────────────────
// Supabase 구현 — TECH_SPEC §7
//
// 모든 조회는 사용자 세션 기반 클라이언트로 하므로 RLS 판정을 받는다.
// 삭제된 글이 목록에 안 나오는 것도 애플리케이션 필터가 아니라
// posts_select 정책이 보장한다. is_deleted 필터를 함께 두는 것은
// 인덱스 활용과 의도 명시를 위한 것이다.
// ─────────────────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  CommentNode,
  PostDetail,
  PostListItem,
} from "@/types/db";
import {
  POSTS_PER_PAGE,
  type PostsQuery,
  type PostsResult,
  type QueryProvider,
} from "./types";

const WITHDRAWN_LABEL = "탈퇴한 사용자";

/** 조인 결과의 중첩 형태 — PostgREST 는 관계를 객체로 내려준다 */
interface JoinedAuthor {
  nickname: string | null;
  status: "active" | "withdrawn" | null;
}
interface JoinedCategory {
  slug: string;
  name: string;
}

function nicknameOf(author: JoinedAuthor | null): string {
  if (!author?.nickname || author.status === "withdrawn") {
    return WITHDRAWN_LABEL;
  }
  return author.nickname;
}

const POST_LIST_SELECT = `
  id, title, created_at, view_count, comment_count, is_pinned,
  author:profiles!posts_author_id_fkey ( nickname, status ),
  category:categories!posts_category_id_fkey ( slug, name )
`;

const POST_DETAIL_SELECT = `
  id, category_id, author_id, title, content, view_count, comment_count,
  is_pinned, is_deleted, created_at, updated_at, edited_at,
  author:profiles!posts_author_id_fkey ( nickname, status ),
  category:categories!posts_category_id_fkey ( slug, name )
`;

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, sort_order, write_role, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`카테고리 조회 실패: ${error.message}`);
  return data ?? [];
}

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, sort_order, write_role, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`카테고리 조회 실패: ${error.message}`);
  return data;
}

async function getPosts({
  categoryId,
  page = 1,
  perPage = POSTS_PER_PAGE,
  includeDeleted = false,
}: PostsQuery = {}): Promise<PostsResult> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;

  let query = supabase
    .from("posts")
    .select(POST_LIST_SELECT, { count: "exact" })
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (!includeDeleted) query = query.eq("is_deleted", false);
  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error, count } = await query;
  if (error) throw new Error(`글 목록 조회 실패: ${error.message}`);

  const items: PostListItem[] = (data ?? []).map((row) => {
    const r = row as unknown as {
      id: number;
      title: string;
      created_at: string;
      view_count: number;
      comment_count: number;
      is_pinned: boolean;
      author: JoinedAuthor | null;
      category: JoinedCategory;
    };
    return {
      id: r.id,
      title: r.title,
      created_at: r.created_at,
      view_count: r.view_count,
      comment_count: r.comment_count,
      is_pinned: r.is_pinned,
      author_nickname: nicknameOf(r.author),
      category_slug: r.category.slug,
      category_name: r.category.name,
    };
  });

  return { items, total: count ?? items.length };
}

async function getPost(id: number): Promise<PostDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_DETAIL_SELECT)
    .eq("id", id)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) throw new Error(`글 조회 실패: ${error.message}`);
  if (!data) return null;

  const r = data as unknown as PostDetail & {
    author: JoinedAuthor | null;
    category: JoinedCategory;
  };

  return {
    id: r.id,
    category_id: r.category_id,
    author_id: r.author_id,
    title: r.title,
    content: r.content,
    view_count: r.view_count,
    comment_count: r.comment_count,
    is_pinned: r.is_pinned,
    is_deleted: r.is_deleted,
    created_at: r.created_at,
    updated_at: r.updated_at,
    edited_at: r.edited_at,
    author_nickname: nicknameOf(r.author),
    category_slug: r.category.slug,
    category_name: r.category.name,
  };
}

/**
 * 댓글은 평면으로 받아 parent_id 기준 2단 트리로 조립한다.
 * 상세 본문과 조인하지 않는 이유는 본문이 댓글 수만큼 중복 전송되기 때문이다.
 */
async function getCommentTree(postId: number): Promise<CommentNode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select(
      `id, post_id, author_id, parent_id, content, is_deleted,
       created_at, updated_at,
       author:profiles!comments_author_id_fkey ( nickname, status )`,
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`댓글 조회 실패: ${error.message}`);

  const flat = (data ?? []).map((row) => {
    const r = row as unknown as CommentNode & { author: JoinedAuthor | null };
    return {
      id: r.id,
      post_id: r.post_id,
      author_id: r.author_id,
      parent_id: r.parent_id,
      content: r.content,
      is_deleted: r.is_deleted,
      created_at: r.created_at,
      updated_at: r.updated_at,
      author_nickname: nicknameOf(r.author),
      replies: [] as CommentNode[],
    };
  });

  const nodes = new Map(flat.map((c) => [c.id, c]));
  const roots: CommentNode[] = [];
  for (const c of flat) {
    if (c.parent_id === null) roots.push(c);
    else nodes.get(c.parent_id)?.replies.push(c);
  }
  return roots;
}

export const supabaseProvider: QueryProvider = {
  getCategories,
  getCategoryBySlug,
  getPosts,
  getPost,
  getCommentTree,
};
