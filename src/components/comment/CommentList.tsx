import { ButtonLink } from "@/components/ui/Button";
import type { CommentNode } from "@/types/db";
import { CommentForm } from "./CommentForm";
import { CommentItem, type Viewer } from "./CommentItem";

/**
 * 댓글 목록 (F-301~F-304).
 *
 * 대댓글은 1단계까지만 — 답글 버튼은 최상위 댓글에만 달린다.
 * DB 트리거(enforce_comment_depth)가 최종 강제한다.
 */
export function CommentList({
  postId,
  comments,
  viewer,
}: {
  postId: number;
  comments: CommentNode[];
  viewer: Viewer | null;
}) {
  const total = countVisible(comments);

  return (
    <section aria-label="댓글" className="border-t border-line">
      <h2 className="px-4 pb-1 pt-5 text-list font-bold text-ink lg:px-5">
        댓글 {total}
      </h2>

      {comments.length === 0 ? (
        <p className="px-4 py-8 text-center text-meta text-ink-sub lg:px-5">
          {viewer
            ? "첫 댓글을 남겨보세요."
            : "아직 댓글이 없습니다."}
        </p>
      ) : (
        <ul className="divide-y divide-line/70">
          {comments.map((c) => (
            <li key={c.id}>
              <CommentItem
                node={c}
                postId={postId}
                viewer={viewer}
                canReply={Boolean(viewer)}
              />
              {c.replies.length > 0 && (
                <ul className="border-t border-line/70 bg-surface">
                  {c.replies.map((r) => (
                    <li
                      key={r.id}
                      className="border-b border-line/50 last:border-b-0"
                    >
                      <CommentItem
                        node={r}
                        postId={postId}
                        viewer={viewer}
                        isReply
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-line px-4 py-5 lg:px-5">
        {viewer ? (
          <CommentForm postId={postId} />
        ) : (
          /* 비회원 전환 유도 — 팝업·모달을 쓰지 않는다 (PRD §5) */
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
        )}
      </div>
    </section>
  );
}

function countVisible(nodes: CommentNode[]): number {
  return nodes.reduce(
    (n, c) => n + (c.is_deleted ? 0 : 1) + countVisible(c.replies),
    0,
  );
}
