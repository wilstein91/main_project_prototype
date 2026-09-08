import { notFound } from "next/navigation";
import { UnderConstruction } from "@/components/gate/UnderConstruction";
import { gate } from "@/config/features";

const STATE = gate("companyIntro");

export const metadata = {
  title: "회사 소개",
  robots: STATE === "live" ? undefined : { index: false, follow: false },
};

/**
 * 자문사 소개 — 자문사 트랙이므로 게이트를 통과해야 한다 (TECH_SPEC §9.6).
 * 게이트 판정은 서버에서 한다. 클라이언트에서 숨기면 hidden 상태의
 * 콘텐츠가 번들에 포함되어 열람 가능해진다.
 */
export default function CompanyPage() {
  if (STATE === "hidden") notFound();
  if (STATE === "under_construction") {
    return <UnderConstruction featureKey="companyIntro" />;
  }

  // 법인 설립 후 활성화될 실제 내용 — 미리 개발해 둔다.
  return (
    <div className="px-4 py-6 lg:px-0 lg:py-0">
      <h1 className="text-[26px] font-bold text-ink">회사 소개</h1>
    </div>
  );
}
