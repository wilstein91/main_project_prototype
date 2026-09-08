"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCommentAction } from "@/lib/actions/comment";
import { idle } from "@/lib/actions/result";
import { FormFeedback } from "@/components/ui/FormFeedback";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";

/** 댓글·대댓글 작성 (F-301 / F-302) */
export function CommentForm({
  postId,
  parentId,
  onDone,
  autoFocus,
}: {
  postId: number;
  parentId?: number;
  onDone?: () => void;
  autoFocus?: boolean;
}) {
  const [state, action] = useActionState(createCommentAction, idle);
  const formRef = useRef<HTMLFormElement>(null);

  // 성공 시 입력을 비우고, 대댓글이면 입력창을 닫는다
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      onDone?.();
    }
  }, [state, onDone]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      {!state.ok && <FormFeedback state={state} />}
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="parentId" value={parentId ?? ""} />

      <label className="sr-only" htmlFor={`comment-${parentId ?? "root"}`}>
        {parentId ? "답글 내용" : "댓글 내용"}
      </label>
      <Textarea
        id={`comment-${parentId ?? "root"}`}
        name="content"
        rows={parentId ? 2 : 3}
        maxLength={1000}
        placeholder={parentId ? "답글을 입력하세요" : "댓글을 입력하세요"}
        autoFocus={autoFocus}
        required
      />

      <div className="flex justify-end gap-2">
        {parentId && onDone && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            취소
          </Button>
        )}
        <SubmitButton size="sm" pendingLabel="등록 중…">
          등록
        </SubmitButton>
      </div>
    </form>
  );
}
