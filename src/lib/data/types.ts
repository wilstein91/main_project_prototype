import type {
  Category,
  CommentNode,
  PostDetail,
  PostListItem,
} from "@/types/db";

export const POSTS_PER_PAGE = 20;

export interface PostsQuery {
  /** 없으면 전체 카테고리 통합 피드 */
  categoryId?: number;
  page?: number;
  perPage?: number;
  /** 관리자 화면에서 삭제된 글까지 볼 때만 true */
  includeDeleted?: boolean;
}

export interface PostsResult {
  items: PostListItem[];
  total: number;
}

/**
 * 데이터 접근 계약.
 *
 * 시드 구현(queries.seed.ts)과 Supabase 구현(queries.supabase.ts)이
 * 이 인터페이스를 만족하고, queries.ts 가 설정을 보고 하나를 고른다.
 * 화면·액션은 queries.ts 만 import 한다.
 */
export interface QueryProvider {
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getPosts(q?: PostsQuery): Promise<PostsResult>;
  getPost(id: number): Promise<PostDetail | null>;
  getCommentTree(postId: number): Promise<CommentNode[]>;
}
