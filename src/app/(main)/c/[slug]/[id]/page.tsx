import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentList } from "@/components/comment/CommentList";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { POST_DISCLAIMER } from "@/config/legal";
import { getCommentTree, getPost } from "@/lib/data/queries";
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
  const post = await getPost(Number(id));
  if (!post || post.category_slug !== slug) notFound();

  const comments = await getCommentTree(post.id);

  return (
    <article className="lg:rounded-[var(--radius-md)] lg:border lg:border-line lg:bg-canvas">
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
      </header>

      <div className="px-4 py-6 lg:px-5">
        <div className="prose-post text-ink">{post.content}</div>

        {/* D-1 작성자 책임 고지 */}
        <p className="mt-8 rounded-[var(--radius-sm)] bg-surface px-4 py-3 text-[12px] leading-relaxed text-ink-sub">
          {POST_DISCLAIMER}
        </p>
      </div>

      <CommentList comments={comments} />

      {/* 비회원 전환 유도 — 팝업·모달을 쓰지 않는다 (PRD §5) */}
      <div className="border-t border-line px-4 py-5 lg:px-5">
        <div className="flex flex-col items-start gap-3 rounded-[var(--radius-md)] bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-list font-semibold text-ink">
            댓글을 남기려면 로그인이 필요합니다.
          </p>
          <div className="flex shrink-0 gap-2">
            <ButtonLink href="/login" variant="secondary" size="sm">
              로그인
            </ButtonLink>
            <ButtonLink href="/signup" size="sm">
              회원가입
            </ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}
