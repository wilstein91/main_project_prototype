// ─────────────────────────────────────────────────────────────
// 시드 구현 — Supabase 키가 없을 때만 쓰인다.
//
// 실 DB 연결 확인 후 이 파일과 seed.ts 를 함께 삭제하고,
// queries.ts 의 분기도 제거한다.
// ─────────────────────────────────────────────────────────────

import type {
  Category,
  CommentNode,
  PostDetail,
  PostListItem,
} from "@/types/db";
import { categories, comments, posts, profiles } from "./seed";
import {
  POSTS_PER_PAGE,
  type PostsQuery,
  type PostsResult,
  type QueryProvider,
} from "./types";

const WITHDRAWN_LABEL = "탈퇴한 사용자";

function nicknameOf(authorId: string | null): string {
  if (!authorId) return WITHDRAWN_LABEL;
  const p = profiles.find((x) => x.id === authorId);
  if (!p || p.status === "withdrawn") return WITHDRAWN_LABEL;
  return p.nickname;
}

function categoryOf(categoryId: number): Category {
  const c = categories.find((x) => x.id === categoryId);
  if (!c) throw new Error(`unknown category_id: ${categoryId}`);
  return c;
}

async function getCategories(): Promise<Category[]> {
  return categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return categories.find((c) => c.slug === slug && c.is_active) ?? null;
}

async function getPosts({
  categoryId,
  page = 1,
  perPage = POSTS_PER_PAGE,
  includeDeleted = false,
}: PostsQuery = {}): Promise<PostsResult> {
  const filtered = posts
    .filter((p) => includeDeleted || !p.is_deleted)
    .filter((p) => (categoryId ? p.category_id === categoryId : true))
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return b.created_at.localeCompare(a.created_at);
    });

  const start = (page - 1) * perPage;
  const items: PostListItem[] = filtered
    .slice(start, start + perPage)
    .map((p) => {
      const c = categoryOf(p.category_id);
      return {
        id: p.id,
        title: p.title,
        created_at: p.created_at,
        view_count: p.view_count,
        comment_count: p.comment_count,
        is_pinned: p.is_pinned,
        author_nickname: nicknameOf(p.author_id),
        category_slug: c.slug,
        category_name: c.name,
      };
    });

  return { items, total: filtered.length };
}

async function getPost(id: number): Promise<PostDetail | null> {
  const p = posts.find((x) => x.id === id && !x.is_deleted);
  if (!p) return null;
  const c = categoryOf(p.category_id);
  return {
    ...p,
    author_nickname: nicknameOf(p.author_id),
    category_slug: c.slug,
    category_name: c.name,
  };
}

async function getCommentTree(postId: number): Promise<CommentNode[]> {
  const flat = comments
    .filter((c) => c.post_id === postId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const nodes = new Map<number, CommentNode>();
  for (const c of flat) {
    nodes.set(c.id, {
      ...c,
      author_nickname: nicknameOf(c.author_id),
      replies: [],
    });
  }

  const roots: CommentNode[] = [];
  for (const c of flat) {
    const node = nodes.get(c.id)!;
    if (c.parent_id === null) roots.push(node);
    else nodes.get(c.parent_id)?.replies.push(node);
  }
  return roots;
}

async function incrementViewCount(): Promise<void> {
  // 시드는 읽기 전용이다.
}

export const seedProvider: QueryProvider = {
  getCategories,
  getCategoryBySlug,
  getPosts,
  getPost,
  getCommentTree,
  incrementViewCount,
};
