import type { ReactNode } from "react";

export interface Article {
  no: string;
  heading: string;
  body?: string[];
  list?: string[];
  after?: string[];
}

/** 약관·처방침 공통 레이아웃. 문안은 페이지에서 넘긴다. */
export function LegalDoc({
  title,
  notice,
  articles,
  footNote,
}: {
  title: string;
  notice?: ReactNode;
  articles: Article[];
  footNote?: string;
}) {
  return (
    <div className="px-4 py-6 lg:px-0 lg:py-0">
      <h1 className="mb-5 text-[24px] font-bold leading-snug text-ink">
        {title}
      </h1>

      {notice && (
        <div className="mb-8 rounded-[var(--radius-sm)] border border-dashed border-line bg-surface px-4 py-3 text-[12px] leading-relaxed text-ink-sub">
          {notice}
        </div>
      )}

      <div className="flex flex-col gap-8">
        {articles.map((a) => (
          <section key={a.no}>
            <h2 className="mb-2 text-list font-bold text-ink">
              {a.no} ({a.heading})
            </h2>
            <div className="flex flex-col gap-3 text-[14px] leading-[1.8] text-ink-sub">
              {a.body?.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
              {a.list && (
                <ol className="ml-5 flex list-decimal flex-col gap-1.5">
                  {a.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ol>
              )}
              {a.after?.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {footNote && (
        <p className="mt-10 border-t border-line pt-5 text-[12px] text-ink-sub">
          {footNote}
        </p>
      )}
    </div>
  );
}
