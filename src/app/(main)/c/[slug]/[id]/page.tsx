import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentList } from "@/components/comment/CommentList";
import { PostBody } from "@/components/post/PostBody";
import { ViewCounter } from "@/components/post/ViewCounter";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeleteForm } from "@/components/ui/DeleteForm";
import { POST_DISCLAIMER } from "@/config/legal";
import { deletePostAction } from "@/lib/actions/post";
import { getCommentTree, getPost } from "@/lib/data/queries";
import { getViewer } from "@/lib/session";
import { formatCount, formatFullDate } from "@/lib/utils/date";

export async function generateMetadata({
  params,
}: PageProps<"/c/[slug]/[id]">) {
  const { id } = await params;
  const post = await getPost(Number(id));
  if (!post) return {};
  return {
    title: post.title,
    description: post.content.slice(0, 120).replace(/\s+/g, " "),
    openGraph: { title: post.title, type: "article" },
  };
}

/** 글 상세 (F-204) — 비회원도 본문까지 열람 (PRD §5) */
export default async function PostDetailPage({
  params,
}: PageProps<"/c/[slug]/[id]">) {
  const { slug, id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) notFound();

  const post = await getPost(postId);
  if (!post || post.category_slug !== slug) notFound();

  const [comments, viewer] = await Promise.all([
    getCommentTree(post.id),
    getViewer(),
  ]);

  const isMine = viewer?.id === post.author_id;
  const isAdmin = viewer?.role === "admin";

  return (
    <article className="lg:rounded-[var(--radius-md)] lg:border lg:border-line lg:bg-canvas">
      {/* 조회수 (F-208) — 쿠키로 같은 방문자의 재조회를 걸러낸다 */}
      <ViewCounter postId={post.id} />

      <header className="border-b border-line px-4 py-5 lg:px-5">
        <div className="mb-2 flex items-center gap-2">
          <Link
            href={`/c/${post.category_slug}`}
            className="text-meta font-semibold text-brand hover:underline"
          >
            {post.category_name}
          </Link>
          {post.is_pinned && <Badge tone="brand">공지</Badge>}
        </div>

        <h1 className="text-[22px] font-bold leading-snug text-ink">
          {post.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-ink-sub">
          <span className="font-semibold text-ink">{post.author_nickname}</span>
          <span aria-hidden>·</span>
          <span>{formatFullDate(post.created_at)}</span>
          {post.edited_at && (
            <>
              <span aria-hidden>·</span>
              <span>수정됨</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>조회 {formatCount(post.view_count)}</span>
        </div>

        {(isMine || isAdmin) && (
          <div className="mt-3 flex items-center gap-3 text-meta">
            {isMine && (
              <Link
                href={`/c/${post.category_slug}/${post.id}/edit`}
                className="font-semibold text-ink-sub hover:text-brand"
              >
                수정
              </Link>
            )}
            <DeleteForm
              action={deletePostAction}
              hidden={{ postId: post.id }}
              confirmMessage={
                isMine
                  ? "이 글을 삭제할까요?"
                  : "관리자 권한으로 이 글을 삭제합니다. 기록이 남습니다."
              }
              className="text-meta"
            />
          </div>
        )}
      </header>

      <div className="px-4 py-6 lg:px-5">
        <PostBody content={post.content} />

        {/* D-1 작성자 책임 고지 */}
        <p className="mt-8 rounded-[var(--radius-sm)] bg-surface px-4 py-3 text-[12px] leading-relaxed text-ink-sub">
          {POST_DISCLAIMER}
        </p>
      </div>

      <CommentList
        postId={post.id}
        comments={comments}
        viewer={viewer ? { id: viewer.id, isAdmin } : null}
      />

      <div className="border-t border-line px-4 py-4 lg:px-5">
        <ButtonLink
          href={`/c/${post.category_slug}`}
          variant="secondary"
          size="sm"
        >
          목록으로
        </ButtonLink>
      </div>
    </article>
  );
}
