// ─────────────────────────────────────────────────────────────
// DB 타입 — supabase/migrations/0001_init.sql 스키마와 1:1 대응
//
// Supabase 연결 후에는 `npx supabase gen types typescript` 결과물로
// 교체한다. 그때까지 이 파일이 계약서 역할을 한다.
// ─────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin";
export type UserStatus = "active" | "withdrawn";
export type WriteRole = "user" | "admin";

export interface Profile {
  id: string;
  nickname: string;
  role: UserRole;
  status: UserStatus;
  nickname_changed_at: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  write_role: WriteRole;
  is_active: boolean;
}

export interface Post {
  id: number;
  category_id: number;
  author_id: string | null;
  title: string;
  content: string;
  view_count: number;
  comment_count: number;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
}

export interface Comment {
  id: number;
  post_id: number;
  author_id: string | null;
  parent_id: number | null;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

/** 목록·상세에서 조인해 내려오는 형태 */
export interface PostListItem
  extends Pick<
    Post,
    | "id"
    | "title"
    | "created_at"
    | "view_count"
    | "comment_count"
    | "is_pinned"
  > {
  author_nickname: string;
  category_slug: string;
  category_name: string;
}

export interface PostDetail extends Post {
  author_nickname: string;
  category_slug: string;
  category_name: string;
}

export interface CommentNode extends Comment {
  author_nickname: string;
  replies: CommentNode[];
}
