import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/post/PostForm";
import { getCategories, getPost } from "@/lib/data/queries";
import { getViewer } from "@/lib/session";

export const metadata = { title: "글 수정", robots: { index: false } };

/**
 * 글 수정 (F-206) — 작성자 본인만.
 *
 * proxy.ts 가 로그인 여부를 먼저 막고, 여기서 작성자 일치를 확인한다.
 * 최종 판정은 posts_update_own 정책이 하므로, 이 검사를 우회해도
 * DB 가 거부한다.
 */
export default async function EditPostPage({
  params,
}: PageProps<"/c/[slug]/[id]/edit">) {
  const { slug, id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) notFound();

  const [post, viewer, categories] = await Promise.all([
    getPost(postId),
    getViewer(),
    getCategories(),
  ]);

  if (!post || post.category_slug !== slug) notFound();
  if (!viewer) redirect(`/login?redirect=/c/${slug}/${postId}/edit`);
  if (post.author_id !== viewer.id) notFound();

  return (
    <div className="px-4 py-5 lg:px-0 lg:py-0">
      <h1 className="mb-4 text-title font-bold text-ink">글 수정</h1>
      <PostForm
        categories={categories}
        existing={{
          id: post.id,
          title: post.title,
          content: post.content,
          categorySlug: post.category_slug,
        }}
      />
    </div>
  );
}
