import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "페이지를 찾을 수 없습니다" };

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[13px] font-bold tracking-widest text-ink-sub">404</p>
      <h1 className="text-title font-bold text-ink">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="max-w-sm text-meta leading-relaxed text-ink-sub">
        주소가 바뀌었거나 삭제된 글일 수 있습니다. 준비 중인 서비스의 경우
        절차가 완료되면 공개됩니다.
      </p>
      <ButtonLink href="/" className="mt-2">
        홈으로
      </ButtonLink>
    </div>
  );
}
