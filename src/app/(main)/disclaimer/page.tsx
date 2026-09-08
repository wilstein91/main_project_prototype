import { DISCLAIMER_PAGE } from "@/config/legal";

export const metadata = { title: "투자 유의사항" };

/**
 * 투자 유의사항 (F-408 / PRD 부록 A-3)
 * 문안은 config/legal.ts 에서 읽는다 — 변호사 검토 후 수정될 값이다.
 */
export default function DisclaimerPage() {
  return (
    <div className="px-4 py-6 lg:px-0 lg:py-0">
      <h1 className="mb-8 text-[24px] font-bold leading-snug text-ink">
        {DISCLAIMER_PAGE.title}
      </h1>

      <div className="flex flex-col gap-8">
        {DISCLAIMER_PAGE.articles.map((a) => (
          <section key={a.no}>
            <h2 className="mb-2 text-list font-bold text-ink">
              {a.no} ({a.heading})
            </h2>
            <div className="flex flex-col gap-3 text-[14px] leading-[1.8] text-ink-sub">
              {a.body.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
              {"list" in a && a.list && (
                <ol className="ml-5 flex list-decimal flex-col gap-1.5">
                  {a.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ol>
              )}
              {"after" in a &&
                a.after?.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 border-t border-line pt-5 text-[12px] text-ink-sub">
        {DISCLAIMER_PAGE.revisedNote}
      </p>
    </div>
  );
}
