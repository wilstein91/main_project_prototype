// ─────────────────────────────────────────────────────────────
// 데이터 접근 진입점 — 화면·액션은 이 파일만 import 한다.
//
// Supabase 키가 있으면 실 DB, 없으면 시드를 읽는다. 이 분기 덕분에
// 키를 넣는 것만으로 전체 앱이 실 DB 로 전환된다.
//
// 연결 확인 후에는 시드 구현을 삭제하고 이 파일을
//   export * from "./queries.supabase"
// 로 단순화한다.
// ─────────────────────────────────────────────────────────────

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { seedProvider } from "./queries.seed";
import { supabaseProvider } from "./queries.supabase";
import type { QueryProvider } from "./types";

const provider: QueryProvider = isSupabaseConfigured()
  ? supabaseProvider
  : seedProvider;

/** 시드 모드인지 — 화면에 '개발 중' 안내를 띄울지 판정하는 데 쓴다 */
export const isSeedMode = () => !isSupabaseConfigured();

export const getCategories = provider.getCategories;
export const getCategoryBySlug = provider.getCategoryBySlug;
export const getPosts = provider.getPosts;
export const getPost = provider.getPost;
export const getCommentTree = provider.getCommentTree;

export { POSTS_PER_PAGE } from "./types";
export type { PostsQuery, PostsResult } from "./types";
