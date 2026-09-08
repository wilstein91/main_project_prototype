"use client";

import { useActionState, useState } from "react";
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
  categoryName: string;
  isPinned: boolean;
}

/**
 * 글 작성·수정 (F-205 / F-206 / F-209).
 *
 * 관리자는 운영자 전용 카테고리(공지사항)를 고를 수 있고, 글을 목록
 * 최상단에 고정할 수 있다. 일반 회원에게는 두 선택지가 보이지 않으며,
 * 폼을 조작해도 RLS 가 거부한다 (0003 마이그레이션).
 *
 * 수정 시 카테고리는 바꾸지 않는다 — 글이 다른 게시판으로 옮겨지면
 * 기존 링크와 댓글 맥락이 어긋난다.
 */
export function PostForm({
  categories,
  presetSlug,
  existing,
  isAdmin = false,
}: {
  categories: Category[];
  presetSlug?: string;
  existing?: Existing;
  isAdmin?: boolean;
}) {
  const isEdit = Boolean(existing);
  const [state, action] = useActionState(
    isEdit ? updatePostAction : createPostAction,
    idle,
  );
  const [pinned, setPinned] = useState(existing?.isPinned ?? false);

  // 관리자는 운영자 전용 게시판도 쓸 수 있다
  const writable = categories.filter(
    (c) => c.write_role === "user" || isAdmin,
  );
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
        <>
          <input type="hidden" name="postId" value={existing!.id} />
          <Field label="카테고리">
            <Input value={existing!.categoryName} disabled readOnly />
          </Field>
        </>
      ) : (
        <Field label="카테고리" required>
          <Select name="categoryId" defaultValue={defaultId} required>
            {writable.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.write_role === "admin" ? " (운영자 전용)" : ""}
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

      {isAdmin && (
        <label className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-brand-soft px-4 py-4">
          <input
            type="checkbox"
            name="isPinned"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]"
          />
          <span className="text-meta leading-relaxed">
            <b className="font-bold text-ink">목록 상단에 고정</b>
            <span className="ml-1 text-[11px] font-semibold text-brand">
              운영자
            </span>
            <br />
            <span className="text-ink-sub">
              전체 피드와 해당 게시판 목록의 맨 위에 &lsquo;공지&rsquo; 표시와
              함께 노출됩니다.
            </span>
          </span>
        </label>
      )}

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
