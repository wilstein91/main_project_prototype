import { PostForm } from "@/components/post/PostForm";
import { PendingNotice } from "@/components/ui/PendingNotice";
import { getCategories, isSeedMode } from "@/lib/data/queries";

export const metadata = { title: "글쓰기" };

/**
 * 글 작성 (F-205).
 * 미인증 접근은 proxy.ts 가 /login?redirect=/write 로 보낸다.
 */
export default async function WritePage({ searchParams }: PageProps<"/write">) {
  const { category } = await searchParams;
  const categories = await getCategories();
  const preset = typeof category === "string" ? category : undefined;

  return (
    <div className="px-4 py-5 lg:px-0 lg:py-0">
      <h1 className="mb-4 text-title font-bold text-ink">글쓰기</h1>
      {isSeedMode() && <PendingNotice ticket="Supabase 연결" />}
      <PostForm categories={categories} presetSlug={preset} />
    </div>
  );
}
