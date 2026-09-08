import { LogoLockup } from "@/components/brand/LogoLockup";
import { ButtonLink } from "@/components/ui/Button";
import { COMPANY, displayServiceName } from "@/config/company";

export const metadata = { title: "서비스 소개" };

/**
 * 서비스 소개 (F-406) — 커뮤니티 트랙이므로 게이트를 걸지 않는다.
 * 회사 소개가 아니라 커뮤니티 소개다. 자문사 소개는 /company 로 분리.
 *
 * 운영 원칙 4개는 PRD §3.2 불변조건을 사용자 언어로 옮긴 것이다.
 */
const PRINCIPLES = [
  {
    title: "운영자는 투자 의견을 내지 않습니다",
    body: "운영자 계정으로는 서비스 운영에 관한 공지만 올립니다. 시황 분석이나 종목 의견을 게시하지 않습니다.",
  },
  {
    title: "투자정보를 팔지 않습니다",
    body: "특정 회원에게만 공개되는 유료 투자정보를 제공하지 않습니다. 모든 게시물은 회원 누구나 볼 수 있습니다.",
  },
  {
    title: "종목을 추천하지 않습니다",
    body: "서비스가 종목을 골라주거나 매수·매도 신호를 만들지 않습니다. 인기글은 조회수와 반응을 기준으로만 정해집니다.",
  },
  {
    title: "수익률을 내세우지 않습니다",
    body: "수익률 인증이나 순위 기능을 만들지 않습니다. 누가 얼마를 벌었는지로 경쟁하는 곳이 아닙니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="px-4 py-6 lg:px-6 lg:py-0">
      {/*
       * 이름의 근거를 그림으로 먼저 보여준다. 아래 본문에서 '영웅호걸'
       * 이라는 이름의 출처를 설명하는데, 그 설명과 마크가 같은 자리에
       * 있어야 로고가 장식이 아니라 뜻으로 읽힌다 (DESIGN.md §3.3).
       */}
      <header className="mb-8 rounded-[var(--radius-md)] bg-brand-soft px-6 py-6 lg:px-8 lg:py-8">
        <h1>
          <LogoLockup className="w-[300px] max-w-full sm:w-[400px] lg:w-[470px]" />
        </h1>
        <p className="mt-3 text-list leading-relaxed text-ink-sub">
          {COMPANY.tagline}
        </p>
      </header>

      <section className="mb-8 flex flex-col gap-4 text-body leading-[1.75] text-ink">
        <p>
          {COMPANY.serviceName}은 개인 투자자들이 투자 정보와 의견을 나누는
          커뮤니티입니다. 빠르고 가볍게 읽고 쓸 수 있으면서도, 글이 눈에 편하게
          정돈된 게시판을 만들려고 합니다.
        </p>
        <p>
          이름은 미국주식 커뮤니티에서 쓰이는 &ldquo;외화를 벌어오는 영웅호걸들의
          시간이다&rdquo;라는 말에서 가져왔습니다. 크게 벌든 크게 깨지든, 결국
          같은 장에서 같은 고민을 하는 사람들이 모이는 곳이라는 뜻으로
          받아들이면 좋겠습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-title font-bold text-ink">운영 원칙</h2>
        <ul className="flex flex-col gap-3">
          {PRINCIPLES.map((p, i) => (
            <li
              key={p.title}
              className="rounded-[var(--radius-md)] bg-surface px-4 py-4"
            >
              <p className="mb-1 flex items-baseline gap-2 text-list font-bold text-ink">
                <span className="text-brand">{i + 1}</span>
                {p.title}
              </p>
              <p className="text-meta leading-relaxed text-ink-sub">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 rounded-[var(--radius-md)] border border-line px-4 py-4">
        <h2 className="mb-2 text-list font-bold text-ink">
          현재 운영 상태
        </h2>
        <p className="text-meta leading-relaxed text-ink-sub">
          {displayServiceName()}은 시험 운영 중이며 {COMPANY.operator}{" "}
          형태로 무료 제공됩니다. 법인 설립과 투자자문업 신고·등록 절차는
          완료되지 않았고, 해당 절차가 필요한 영역은 사이트에서 준비 중으로
          표시됩니다. 커뮤니티 서비스는 그와 무관하게 정상 운영됩니다.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/">커뮤니티 둘러보기</ButtonLink>
        <ButtonLink href="/disclaimer" variant="secondary">
          투자 유의사항
        </ButtonLink>
      </div>
    </div>
  );
}
