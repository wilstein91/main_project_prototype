"use client";

import { useActionState, useEffect } from "react";
import { updateCommentAction } from "@/lib/actions/comment";
import { idle } from "@/lib/actions/result";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { FormFeedback } from "@/components/ui/FormFeedback";
import { SubmitButton } from "@/components/ui/SubmitButton";

/** 댓글 수정 (F-303) */
export function CommentEditForm({
  commentId,
  initialContent,
  onDone,
}: {
  commentId: number;
  initialContent: string;
  onDone: () => void;
}) {
  const [state, action] = useActionState(updateCommentAction, idle);

  // 성공하면 편집 모드를 닫는다. 내용은 revalidatePath 로 갱신된다.
  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="mt-2 flex flex-col gap-2">
      {!state.ok && <FormFeedback state={state} />}
      <input type="hidden" name="commentId" value={commentId} />

      <label className="sr-only" htmlFor={`edit-${commentId}`}>
        댓글 수정
      </label>
      <Textarea
        id={`edit-${commentId}`}
        name="content"
        rows={3}
        maxLength={1000}
        defaultValue={initialContent}
        autoFocus
        required
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          취소
        </Button>
        <SubmitButton size="sm" pendingLabel="저장 중…">
          저장
        </SubmitButton>
      </div>
    </form>
  );
}
