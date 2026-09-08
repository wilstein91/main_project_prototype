"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";
import type { ComponentProps } from "react";

/**
 * 제출 중 비활성화 — 이중 제출을 막는다.
 * useFormStatus 는 form 안에서만 동작하므로 별 컴포넌트로 분리한다.
 */
export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  ...rest
}: {
  children: React.ReactNode;
  pendingLabel?: string;
} & Omit<ComponentProps<typeof Button>, "type" | "children">) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} {...rest}>
      {pending ? (pendingLabel ?? "처리 중…") : children}
    </Button>
  );
}
