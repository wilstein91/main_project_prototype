import { ButtonLink } from "@/components/ui/Button";
import { unblockedBy, type AdvisoryFeature } from "@/config/features";
import { UNDER_CONSTRUCTION_NOTICE } from "@/config/legal";

/**
 * 자문사 트랙 준비 중 안내 — TECH_SPEC §9.7
 * 고지 문구는 config/legal.ts 에서 읽는다 (변호사 검토 후 수정될 값).
 * 막다른 길을 만들지 않도록 커뮤니티 복귀 경로를 함께 둔다.
 */
export function UnderConstruction({
  featureKey,
}: {
  featureKey: AdvisoryFeature;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 lg:px-6">
      <div className="mb-8">
        <p className="mb-2 text-meta font-semibold text-ink-sub">준비 중</p>
        <h1 className="text-2xl font-bold leading-snug text-ink">
          {UNDER_CONSTRUCTION_NOTICE.heading}
        </h1>
      </div>

      <div className="rounded-[var(--radius-md)] bg-surface p-5">
        <dl className="flex flex-col gap-2 text-meta">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-sub">공개 조건</dt>
            <dd className="font-medium text-ink">{unblockedBy(featureKey)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-sub">공개 시점</dt>
            <dd className="font-medium text-ink">절차 완료 후 별도 공지</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex flex-col gap-4 text-[14px] leading-[1.75] text-ink-sub">
        {UNDER_CONSTRUCTION_NOTICE.paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>

      <div className="mt-8">
        <ButtonLink href="/" variant="secondary">
          커뮤니티 둘러보기
        </ButtonLink>
      </div>
    </div>
  );
}
