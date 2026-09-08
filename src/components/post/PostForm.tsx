"use client";

import { useActionState } from "react";
import { createPostAction, updatePostAction } from "@/lib/actions/post";
import { idle } from "@/lib/actions/result";
import { ButtonLink } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { FieldError, FormFeedback } from "@/components/ui/FormFeedback";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { Category } from "@/types/db";

interface Existing {
  id: number;
  title: string;
  content: string;
  categorySlug: string;
}

/**
 * 글 작성·수정 (F-205 / F-206).
 *
 * 수정 시 카테고리는 바꾸지 않는다 — 글이 다른 게시판으로 옮겨지면
 * 기존 링크와 댓글 맥락이 어긋난다.
 */
export function PostForm({
  categories,
  presetSlug,
  existing,
}: {
  categories: Category[];
  presetSlug?: string;
  existing?: Existing;
}) {
  const isEdit = Boolean(existing);
  const [state, action] = useActionState(
    isEdit ? updatePostAction : createPostAction,
    idle,
  );

  const writable = categories.filter((c) => c.write_role === "user");
  const defaultId =
    writable.find((c) => c.slug === presetSlug)?.id ?? writable[0]?.id;

  const cancelHref = existing
    ? `/c/${existing.categorySlug}/${existing.id}`
    : presetSlug
      ? `/c/${presetSlug}`
      : "/";

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormFeedback state={state} />

      {isEdit ? (
        <input type="hidden" name="postId" value={existing!.id} />
      ) : (
        <Field label="카테고리" required>
          <Select name="categoryId" defaultValue={defaultId} required>
            {writable.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <FieldError state={state} name="categoryId" />
        </Field>
      )}

      <Field label="제목" required hint="최대 100자">
        <Input
          name="title"
          maxLength={100}
          placeholder="제목을 입력하세요"
          defaultValue={existing?.title}
          required
        />
        <FieldError state={state} name="title" />
      </Field>

      <Field
        label="본문"
        required
        hint="마크다운을 사용할 수 있습니다. 최대 20,000자"
      >
        <Textarea
          name="content"
          rows={16}
          maxLength={20000}
          placeholder="내용을 입력하세요"
          defaultValue={existing?.content}
          required
        />
        <FieldError state={state} name="content" />
      </Field>

      <div className="rounded-[var(--radius-sm)] bg-surface px-4 py-3 text-[12px] leading-relaxed text-ink-sub">
        시세조종·허위사실, 대가를 받은 종목 권유, 원금·수익률 보장 취지의
        게시물은 사전 통지 없이 삭제될 수 있습니다.
      </div>

      <div className="flex justify-end gap-2">
        <ButtonLink href={cancelHref} variant="secondary">
          취소
        </ButtonLink>
        <SubmitButton pendingLabel={isEdit ? "수정 중…" : "등록 중…"}>
          {isEdit ? "수정" : "등록"}
        </SubmitButton>
      </div>
    </form>
  );
}
