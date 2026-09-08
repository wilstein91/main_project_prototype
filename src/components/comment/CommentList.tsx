import { formatFullDate } from "@/lib/utils/date";
import type { CommentNode } from "@/types/db";

/**
 * 댓글 — 대댓글은 1단계까지만 (F-302, DB 트리거로도 강제).
 * 삭제된 댓글은 자리를 남긴다. 지우면 대댓글 트리가 무너진다.
 */
export function CommentList({ comments }: { comments: CommentNode[] }) {
  const total = countVisible(comments);

  return (
    <section aria-label="댓글" className="border-t border-line">
      <h2 className="px-4 pb-1 pt-5 text-list font-bold text-ink lg:px-5">
        댓글 {total}
      </h2>

      {total === 0 && comments.length === 0 ? (
        <p className="px-4 py-8 text-center text-meta text-ink-sub lg:px-5">
          첫 댓글을 남겨보세요.
        </p>
      ) : (
        <ul className="divide-y divide-line/70">
          {comments.map((c) => (
            <li key={c.id}>
              <Item node={c} />
              {c.replies.length > 0 && (
                <ul className="border-t border-line/70 bg-surface">
                  {c.replies.map((r) => (
                    <li key={r.id} className="border-b border-line/50 last:border-b-0">
                      <Item node={r} isReply />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Item({ node, isReply }: { node: CommentNode; isReply?: boolean }) {
  if (node.is_deleted) {
    return (
      <div
        className={`px-4 py-3.5 text-meta text-ink-sub lg:px-5 ${
          isReply ? "pl-9 lg:pl-11" : ""
        }`}
      >
        삭제된 댓글입니다.
      </div>
    );
  }

  return (
    <div className={`px-4 py-3.5 lg:px-5 ${isReply ? "pl-9 lg:pl-11" : ""}`}>
      <div className="mb-1 flex items-center gap-2 text-meta">
        {isReply && (
          <span aria-hidden className="text-ink-sub">
            ↳
          </span>
        )}
        <span className="font-semibold text-ink">{node.author_nickname}</span>
        <span className="text-ink-sub">{formatFullDate(node.created_at)}</span>
      </div>
      <p className="prose-post text-[15px] text-ink">{node.content}</p>
    </div>
  );
}

function countVisible(nodes: CommentNode[]): number {
  return nodes.reduce(
    (n, c) => n + (c.is_deleted ? 0 : 1) + countVisible(c.replies),
    0,
  );
}
