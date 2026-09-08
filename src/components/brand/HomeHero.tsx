import { ButtonLink } from "@/components/ui/Button";
import { COMPANY } from "@/config/company";
import { BladeCrest } from "./BladeCrest";

/**
 * 홈 상단 브랜드 띠 — 비회원에게만 보인다 (DESIGN.md §4)
 *
 * ## 왜 비회원에게만
 *
 * 커뮤니티의 기본값은 '목록이 바로 보이는 것' 이다 (PRD §5, 디시의
 * 가벼움). 매일 오는 회원에게 같은 소개 문구를 매번 보여주면 스크롤만
 * 늘어난다. 반면 처음 온 사람에게 목록만 던지면 여기가 무엇을 하는
 * 곳인지, 읽어도 되는 곳인지 알 수 없다.
 *
 * 그래서 로그인하면 사라진다. 브랜드는 사용자가 아직 할 일이 없을 때만
 * 말을 건다 (DESIGN.md §2 톤).
 *
 * ## 무겁지 않게
 *
 * 진한 청록을 꽉 채우면 금융사 홈페이지가 된다. 연한 청록 바닥에 먹색
 * 글씨로 두고, 색은 삽화 한 점에만 몰아준다. 높이는 모바일에서
 * 200px 을 넘기지 않는다 — 첫 화면에 목록 첫 행이 함께 보여야 한다.
 */
export function HomeHero() {
  return (
    <section className="overflow-hidden border-b border-line bg-brand-soft lg:rounded-t-[var(--radius-md)] lg:border lg:border-line">
      <div className="flex items-center justify-between gap-2 px-4 py-5 lg:px-7 lg:py-7">
        <div className="min-w-0">
          <h1 className="text-title font-black tracking-[-0.02em] text-ink lg:text-display">
            개인 투자자들의 게시판
          </h1>
          <p className="mt-1.5 max-w-[26rem] text-meta leading-relaxed text-ink-sub lg:text-list">
            종목·시황·질문을 회원끼리 나눕니다. 읽는 것은 로그인 없이,
            쓰는 것은 가입 후에.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ButtonLink href="/signup" size="sm">
              가입하고 글쓰기
            </ButtonLink>
            <ButtonLink href="/about" variant="ghost" size="sm">
              {COMPANY.serviceName} 소개
            </ButtonLink>
          </div>
        </div>

        {/*
         * 삽화는 장식이 아니라 이름의 근거다. '영웅호걸' 에서 청룡언월도가
         * 나오고, 브랜드색 청록이 그 '청' 에서 나온다.
         * 좁은 화면에서는 글이 우선이라 접는다.
         */}
        <BladeCrest size={92} className="shrink-0 sm:hidden" />
        <BladeCrest size={132} className="hidden shrink-0 sm:block lg:-mr-2" />
      </div>
    </section>
  );
}
