import { ButtonLink } from "@/components/ui/Button";
import { artwork } from "@/lib/art";
import { COMPANY } from "@/config/company";
import { CornerMarks } from "./Ornaments";
import { Landscape } from "./Scenery";

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
 * ## 화면에서 가장 대담한 한 곳
 *
 * v1.2 는 먹빛과 금테를 깔았지만 화면이 금테 사각형의 반복이 되었다.
 * 그래서 **대담함을 여기 한 곳에 몰았다** — 달, 능선 두 겹, 능선 위의
 * 깃발, 그 앞의 언월도 로고까지 한 장면을 만든다. 대신 목록과 본문은
 * 계속 조용하다. 읽는 화면이기 때문이다 (DESIGN.md §2 · §10.5).
 *
 * 높이는 모바일에서 220px 을 넘기지 않는다 — 첫 화면에 목록 첫 행이
 * 함께 보여야 한다. 장면이 아무리 좋아도 목록을 밀어내면 안 된다.
 */
export function HomeHero() {
  /*
   * 큰 그림은 코드로 그릴 수 없다. public/images/hero.* 가 있으면 그것을
   * 쓰고, 없으면 SVG 로 그린 대체 화면을 보여준다 (DESIGN.md §10.9).
   */
  const hero = artwork("hero");

  return (
    <section
      className="relative overflow-hidden border-b border-gold-dim bg-[#0b1c1f]
        lg:rounded-t-[var(--radius-md)] lg:border lg:border-b-0 lg:border-gold-dim"
    >
      {/* 그림이 배경 전체를 덮는다. 글자는 그 위에 얹힌다 */}
      {hero ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hero}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Landscape className="pointer-events-none absolute inset-0 h-full w-full" />
      )}
      {/* 글자가 놓이는 왼쪽을 어둡게 눌러 대비를 확보한다 */}
      <div
        className="pointer-events-none absolute inset-0
          bg-[linear-gradient(100deg,rgba(6,16,18,0.86)_0%,rgba(6,16,18,0.56)_28%,rgba(6,16,18,0.14)_60%,transparent_100%),linear-gradient(0deg,rgba(6,16,18,0.8)_0%,rgba(6,16,18,0.35)_30%,transparent_62%)]"
      />
      <CornerMarks className="absolute inset-0" />

      <div className="relative px-5 py-9 lg:px-9 lg:py-12">
        {/* 명조 워드마크가 이 화면의 제목이다 (h1 은 아래 '최신글' 이 아니다) */}
        <h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/wordmark.svg"
            alt={COMPANY.serviceName}
            className="h-[38px] w-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:h-[48px] lg:h-[56px]"
          />
        </h1>

        <p className="mt-3 max-w-[30rem] text-meta leading-relaxed text-ink-sub lg:text-list">
          종목·시황·질문을 회원끼리 나눕니다. 읽는 것은 로그인 없이, 쓰는
          것은 가입 후에.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <ButtonLink href="/signup" size="sm">
            가입하고 글쓰기
          </ButtonLink>
          <ButtonLink href="/about" variant="ghost" size="sm">
            서비스 소개
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
