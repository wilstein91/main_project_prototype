import type { ComponentProps, ReactNode } from "react";

const inputCls =
  "h-12 w-full rounded-[var(--radius-sm)] border border-line bg-canvas px-3.5 text-list text-ink outline-none placeholder:text-ink-sub focus:border-brand disabled:bg-surface disabled:text-ink-sub";

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-meta font-semibold text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </span>
      {children}
      {hint && <span className="text-[12px] text-ink-sub">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={`${inputCls} ${className ?? ""}`} {...rest} />;
}

export function Select({
  className,
  children,
  ...rest
}: ComponentProps<"select">) {
  return (
    <select className={`${inputCls} ${className ?? ""}`} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={`w-full resize-y rounded-[var(--radius-sm)] border border-line bg-canvas px-3.5 py-3 text-body leading-[1.7] text-ink outline-none placeholder:text-ink-sub focus:border-brand disabled:bg-surface disabled:text-ink-sub ${
        className ?? ""
      }`}
      {...rest}
    />
  );
}
