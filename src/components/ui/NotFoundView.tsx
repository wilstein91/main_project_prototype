import { Landscape } from "@/components/brand/Scenery";
import { artwork } from "@/lib/art";
import { ButtonLink } from "@/components/ui/Button";
import { CloudRule } from "@/components/brand/Ornaments";

/**
 * 404 본문 — 두 곳에서 쓴다 (DESIGN.md §6).
 *
 * `app/not-found.tsx` 는 헤더·하단바 없이 뜬다. 주소를 잘못 입력해
 * 들어온 사람에게는 그 편이 조용하지만, 게시판을 보다가 삭제된 글을
 * 눌러 404 를 만난 사람에게는 사이트가 사라진 것처럼 보인다.
 * 그래서 `app/(main)/not-found.tsx` 를 따로 두어 앱 안쪽 404 는
 * 헤더와 카테고리 줄을 유지한다. 본문은 이 컴포넌트로 공유한다.
 *
 * 삽화는 넣지만 농담은 넣지 않는다 (DESIGN.md §2). 뭔가 잘못된 화면에서
 * 브랜드가 재치를 부리면 사용자는 자기 문제를 가볍게 취급당한 것으로
 * 받는다. 문장은 무엇이 일어났고 어디로 가면 되는지만 말한다.
 */
export function NotFoundView({ inApp = false }: { inApp?: boolean }) {
  const art = artwork("notfound");

  return (
    <div
      className={`flex flex-col items-center px-6 text-center ${
        inApp ? "py-16" : "min-h-[70vh] justify-center"
      }`}
    >
      {/*
       * 그림 한 조각을 창처럼 잘라 보여준다. 아이콘을 크게 키우면 빈약해
       * 보이지만, 풍경은 잘려도 풍경이다 (DESIGN.md §10.7).
       */}
      <div
        className={`overflow-hidden rounded-[var(--radius-md)] border border-gold-dim ${
          inApp ? "h-[104px] w-[220px]" : "h-[124px] w-[260px]"
        }`}
      >
        {art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art} alt="" aria-hidden className="h-full w-full object-cover" />
        ) : (
          <Landscape className="h-full w-full" />
        )}
      </div>

      <CloudRule className="mt-3 h-4 w-[200px] opacity-60" />
      <p className="nums mt-3 text-meta font-bold text-gold">404</p>
      <h1 className="serif mt-1 text-[24px] font-bold text-ink">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-2 max-w-sm text-meta leading-relaxed text-ink-sub">
        주소가 바뀌었거나 삭제된 글일 수 있습니다. 준비 중인 서비스의 경우
        절차가 완료되면 공개됩니다.
      </p>
      <ButtonLink href="/" className="mt-5">
        홈으로
      </ButtonLink>
    </div>
  );
}
