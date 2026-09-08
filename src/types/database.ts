// ─────────────────────────────────────────────────────────────
// Supabase Database 타입 — supabase/migrations/0001_init.sql 대응
//
// 프로젝트 생성 후 아래로 재생성해 이 파일을 덮어쓴다:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
//
// 그때까지는 손으로 유지한다. 스키마를 바꾸면 이 파일도 같이 바꿀 것.
// 화면에서 쓰는 조회 모델은 src/types/db.ts 에 따로 있다.
// ─────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          role: "user" | "admin";
          status: "active" | "withdrawn";
          nickname_changed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nickname: string;
          role?: "user" | "admin";
          status?: "active" | "withdrawn";
          nickname_changed_at?: string | null;
        };
        Update: {
          nickname?: string;
          status?: "active" | "withdrawn";
          nickname_changed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: number;
          slug: string;
          name: string;
          description: string | null;
          sort_order: number;
          write_role: "user" | "admin";
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          write_role?: "user" | "admin";
          is_active?: boolean;
        };
        Update: {
          slug?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
          write_role?: "user" | "admin";
          is_active?: boolean;
        };
        Relationships: [];
      };
      posts: {
        Row: {
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
        };
        Insert: {
          category_id: number;
          author_id: string;
          title: string;
          content: string;
          is_pinned?: boolean;
        };
        Update: {
          title?: string;
          content?: string;
          is_pinned?: boolean;
          is_deleted?: boolean;
          updated_at?: string;
          edited_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: number;
          post_id: number;
          author_id: string | null;
          parent_id: number | null;
          content: string;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          post_id: number;
          author_id: string;
          parent_id?: number | null;
          content: string;
        };
        Update: {
          content?: string;
          is_deleted?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          target_type: string;
          target_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          actor_id: string;
          action: string;
          target_type: string;
          target_id: string;
          reason?: string | null;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_nickname_available: {
        Args: { p_nickname: string };
        Returns: boolean;
      };
      increment_view_count: {
        Args: { p_post_id: number };
        Returns: undefined;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
