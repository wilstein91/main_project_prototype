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
/*
 * 버튼은 '글자에 걸린 링크' 가 아니라 **금속 명판** 이다 (DESIGN.md §10.6).
 * 테두리·배경·입체감은 plaque 유틸리티가 담당하므로 여기서 rounded 를
 * 지정하지 않는다 — 둘 다 지정하면 모서리가 어긋난다.
 *
 * 글자는 명조다. 인터페이스의 목소리를 본문과 갈라 놓는다.
 */
const base =
  "serif inline-flex items-center justify-center gap-1.5 whitespace-nowrap tracking-tight transition-[filter,color] disabled:opacity-40 disabled:cursor-not-allowed";

/*
 * 주요 버튼의 글자는 흰색이 아니라 **바탕색(먹)** 이다. 밝은 청록 위의
 * 흰 글자는 대비가 2.4:1 까지 떨어져 읽히지 않는다. 먹색으로 두면
 * 7.9:1 이고, 에나멜 명판처럼 보여 게임 톤과도 맞는다 (DESIGN.md §10).
 *
 * 보조 버튼에는 금테를 두른다 — 화면에서 "누를 수 있는 것" 을 금색이
 * 표시하도록 역할을 하나로 모은다.
 */
const variants: Record<Variant, string> = {
  /* 청록 에나멜을 금테에 물린 판. 글자는 판보다 어두워야 읽힌다 */
  primary: "plaque-brand font-bold text-[#08201d] hover:brightness-110",
  secondary: "plaque font-bold text-gold-lit hover:brightness-125",
  /* 판을 쓰지 않는 자리 — 취소처럼 물러나는 행동 */
  ghost: "rounded-[var(--radius-sm)] text-ink-sub hover:bg-surface-lit hover:text-ink",
  danger:
    "rounded-[var(--radius-sm)] font-bold text-danger hover:bg-danger/15",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-list",
  sm: "h-10 px-4 text-meta",
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
