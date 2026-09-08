"use client";

import { useState } from "react";
import { deleteCommentAction } from "@/lib/actions/comment";
import { DeleteForm } from "@/components/ui/DeleteForm";
import { formatFullDate } from "@/lib/utils/date";
import type { CommentNode } from "@/types/db";
import { CommentEditForm } from "./CommentEditForm";
import { CommentForm } from "./CommentForm";

export interface Viewer {
  id: string;
  isAdmin: boolean;
}

/**
 * 댓글 한 건. 답글·수정 토글 때문에 클라이언트 컴포넌트다.
 *
 * 삭제된 댓글은 자리를 남긴다 — 지우면 대댓글 트리가 무너진다.
 * 최종 권한 판정은 RLS 가 하며, 여기 버튼 노출은 편의일 뿐이다.
 * 수정은 본인만 할 수 있다 (관리자도 타인 댓글을 고치지는 않는다 —
 * 부적절한 내용은 고치는 게 아니라 삭제한다).
 */
export function CommentItem({
  node,
  postId,
  viewer,
  isReply,
  canReply,
}: {
  node: CommentNode;
  postId: number;
  viewer: Viewer | null;
  isReply?: boolean;
  canReply?: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);

  const indent = isReply ? "pl-9 lg:pl-11" : "";

  if (node.is_deleted) {
    return (
      <div className={`px-4 py-3.5 text-meta text-ink-sub lg:px-5 ${indent}`}>
        삭제된 댓글입니다.
      </div>
    );
  }

  const isMine = viewer?.id === node.author_id;
  const canEdit = Boolean(isMine);
  const canDelete = Boolean(viewer && (isMine || viewer.isAdmin));

  return (
    <div className={`px-4 py-3.5 lg:px-5 ${indent}`}>
      <div className="mb-1 flex items-center gap-2 text-meta">
        {isReply && (
          <span aria-hidden className="text-ink-sub">
            ↳
          </span>
        )}
        <span className="font-semibold text-ink">{node.author_nickname}</span>
        <span className="text-ink-sub">{formatFullDate(node.created_at)}</span>
        {node.updated_at !== node.created_at && (
          <span className="text-ink-sub">· 수정됨</span>
        )}
      </div>

      {editing ? (
        <CommentEditForm
          commentId={node.id}
          initialContent={node.content}
          onDone={() => setEditing(false)}
        />
      ) : (
        <>
          <p className="prose-post text-[15px] text-ink">{node.content}</p>

          {(canReply || canEdit || canDelete) && (
            <div className="mt-2 flex items-center gap-3 text-[12px]">
              {canReply && !replying && (
                <button
                  type="button"
                  onClick={() => setReplying(true)}
                  className="font-semibold text-ink-sub hover:text-brand"
                >
                  답글
                </button>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="font-semibold text-ink-sub hover:text-brand"
                >
                  수정
                </button>
              )}
              {canDelete && (
                <DeleteForm
                  action={deleteCommentAction}
                  hidden={{ commentId: node.id }}
                  confirmMessage={
                    isMine
                      ? "이 댓글을 삭제할까요?"
                      : "관리자 권한으로 이 댓글을 삭제합니다. 기록이 남습니다."
                  }
                  className="text-[12px]"
                />
              )}
            </div>
          )}
        </>
      )}

      {replying && (
        <div className="mt-3">
          <CommentForm
            postId={postId}
            parentId={node.id}
            onDone={() => setReplying(false)}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
