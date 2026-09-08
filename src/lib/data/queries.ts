// ─────────────────────────────────────────────────────────────
// 데이터 접근 계층
//
// 지금은 seed.ts 를 읽지만, 함수 시그니처는 Supabase 쿼리
// (TECH_SPEC §7) 를 그대로 대체할 수 있게 맞춰 두었다.
// T-07~T-10 에서 이 파일의 본문만 교체하면 호출부는 바뀌지 않는다.
// ─────────────────────────────────────────────────────────────

import type {
  Category,
  CommentNode,
  PostDetail,
  PostListItem,
} from "@/types/db";
import { categories, comments, posts, profiles } from "./seed";

export const POSTS_PER_PAGE = 20;

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

export async function getCategories(): Promise<Category[]> {
  return categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  return categories.find((c) => c.slug === slug && c.is_active) ?? null;
}

interface PostsQuery {
  /** 없으면 전체 카테고리 통합 피드 */
  categoryId?: number;
  page?: number;
  perPage?: number;
}

export async function getPosts({
  categoryId,
  page = 1,
  perPage = POSTS_PER_PAGE,
}: PostsQuery = {}): Promise<{ items: PostListItem[]; total: number }> {
  const filtered = posts
    .filter((p) => !p.is_deleted)
    .filter((p) => (categoryId ? p.category_id === categoryId : true))
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return b.created_at.localeCompare(a.created_at);
    });

  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage).map((p) => {
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

export async function getPost(id: number): Promise<PostDetail | null> {
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

/**
 * 댓글은 평면 목록으로 받아 parent_id 기준 2단 트리로 만든다
 * (TECH_SPEC §7.2 — 본문 중복 전송을 피하려고 쿼리를 분리한다).
 * 삭제된 댓글은 대댓글 트리가 무너지지 않게 자리를 남긴다.
 */
export async function getCommentTree(postId: number): Promise<CommentNode[]> {
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
    if (c.parent_id === null) {
      roots.push(node);
    } else {
      nodes.get(c.parent_id)?.replies.push(node);
    }
  }
  return roots;
}

export async function getVisibleCommentCount(postId: number): Promise<number> {
  return comments.filter((c) => c.post_id === postId && !c.is_deleted).length;
}
