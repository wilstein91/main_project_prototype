import { notFound } from "next/navigation";
import { UnderConstruction } from "@/components/gate/UnderConstruction";
import { gate } from "@/config/features";

const STATE = gate("advisoryIntro");

export const metadata = {
  title: "자문 서비스",
  robots: STATE === "live" ? undefined : { index: false, follow: false },
};

/**
 * 자문 서비스 안내 — 자문업 신고·등록 완료 전까지 hidden.
 * hidden 은 404 를 반환한다. 미신고 상태에서 자문 관련 안내가
 * 노출되면 규제 리스크이므로 링크 숨김만으로 처리하지 않는다.
 */
export default function AdvisoryPage() {
  if (STATE === "hidden") notFound();
  if (STATE === "under_construction") {
    return <UnderConstruction featureKey="advisoryIntro" />;
  }

  return (
    <div className="px-4 py-6 lg:px-6 lg:py-0">
      <h1 className="text-[26px] font-bold text-ink">자문 서비스</h1>
    </div>
  );
}
