import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

/*
 * transition-colors 를 쓰지 않고 두 속성만 지정한다. transition-colors 에는
 * outline-color 가 들어 있어서, 흰 글자 버튼에 키보드 초점이 갈 때 초점
 * 테두리가 흰색에서 브랜드색으로 서서히 변한다 — 흰 바탕에서는 그동안
 * 테두리가 보이지 않는다.
 */
const base =
  "inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] font-semibold transition-[background-color,color] disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong",
  secondary: "bg-surface text-ink hover:bg-line/60",
  ghost: "text-ink-sub hover:bg-surface",
  danger: "text-danger hover:bg-danger/8",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-list",
  sm: "h-9 px-3 text-meta",
};

function cls(variant: Variant, size: Size, extra?: string) {
  return [base, variants[variant], sizes[size], extra]
    .filter(Boolean)
    .join(" ");
}

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={cls(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link className={cls(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
