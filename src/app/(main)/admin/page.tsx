import { PendingNotice } from "@/components/ui/PendingNotice";
import { Badge } from "@/components/ui/Badge";
import { getPosts } from "@/lib/data/queries";
import { formatListDate } from "@/lib/utils/date";

export const metadata = { title: "관리자", robots: { index: false } };

/**
 * 관리자 대시보드 (F-501~F-504)
 *
 * 인증 연결 후 두 겹으로 확인한다 — proxy.ts 에서 세션을 막고,
 * 이 서버 컴포넌트에서 role='admin' 을 다시 확인한다.
 * 미들웨어만 믿지 않는다 (TECH_SPEC §5.2).
 *
 * 운영자 권한은 공지 작성과 게시물 관리로 한정한다.
 * 종목 의견을 게시하지 않는다 (PRD I-1 / D-5).
 */
export default async function AdminPage() {
  const { items } = await getPosts();

  return (
    <div className="px-4 py-5 lg:px-0 lg:py-0">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-title font-bold text-ink">관리자</h1>
        <Badge tone="brand">admin</Badge>
      </div>
      <PendingNotice ticket="T-23" />

      <div className="mb-8 rounded-[var(--radius-sm)] bg-surface px-4 py-3 text-[12px] leading-relaxed text-ink-sub">
        <b className="font-bold text-ink">운영 수칙</b> 운영자 계정으로는 서비스
        운영 공지만 게시합니다. 시황 분석·종목 의견은 게시하지 않습니다.
      </div>

      <section>
        <h2 className="mb-2 text-list font-bold text-ink">최근 게시물</h2>
        <ul className="divide-y divide-line rounded-[var(--radius-md)] border border-line">
          {items.slice(0, 8).map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 px-4 py-3 text-meta"
            >
              <span className="w-10 shrink-0 text-ink-sub">{p.id}</span>
              <span className="w-20 shrink-0 text-ink-sub">
                {p.category_name}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-ink">
                {p.title}
              </span>
              <span className="hidden w-24 shrink-0 text-ink-sub sm:block">
                {p.author_nickname}
              </span>
              <span className="hidden w-14 shrink-0 text-ink-sub sm:block">
                {formatListDate(p.created_at)}
              </span>
              <button
                type="button"
                disabled
                className="shrink-0 font-semibold text-danger disabled:opacity-40"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
