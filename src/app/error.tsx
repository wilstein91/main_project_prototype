"use client";

import { Button, ButtonLink } from "@/components/ui/Button";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      {/*
        * 오류 화면은 클라이언트 컴포넌트라 파일 시스템을 볼 수 없다.
        * 그림 경로를 그대로 쓰고, 없으면 브라우저가 조용히 건너뛰도록
        * onError 로 숨긴다.
        */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/error.webp"
        alt=""
        aria-hidden
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
        className="mb-2 h-32 w-full max-w-[420px] rounded-[var(--radius-md)] border border-gold-dim object-cover"
      />
      <h1 className="serif text-[24px] font-bold text-ink">
        문제가 발생했습니다
      </h1>
      <p className="max-w-sm text-meta leading-relaxed text-ink-sub">
        일시적인 오류일 수 있습니다. 다시 시도해 주세요. 같은 화면이 계속
        나오면 잠시 후 다시 접속해 주세요.
      </p>
      <div className="mt-2 flex gap-2">
        <Button onClick={reset} variant="secondary">
          다시 시도
        </Button>
        <ButtonLink href="/">홈으로</ButtonLink>
      </div>
    </div>
  );
}
