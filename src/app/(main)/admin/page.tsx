import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { DeleteForm } from "@/components/ui/DeleteForm";
import { PendingNotice } from "@/components/ui/PendingNotice";
import { deletePostAction } from "@/lib/actions/post";
import { getPosts, isSeedMode } from "@/lib/data/queries";
import { getViewer } from "@/lib/session";
import { formatListDate } from "@/lib/utils/date";

export const metadata = { title: "관리자", robots: { index: false } };

/**
 * 관리자 대시보드 (F-501~F-504)
 *
 * 권한을 두 겹으로 확인한다 — proxy.ts 가 세션을 막고, 여기서 role 을
 * 다시 확인한다. proxy 만 믿지 않는다 (TECH_SPEC §5.2).
 *
 * 운영자 권한은 공지 작성과 게시물 관리로 한정한다.
 * 종목 의견을 게시하지 않는다 (PRD I-1 / D-5).
 */
export default async function AdminPage() {
  const viewer = await getViewer();

  // 관리자가 아니면 페이지의 존재 자체를 알리지 않는다
  if (!viewer?.role || viewer.role !== "admin") {
    if (!isSeedMode()) notFound();
  }

  const { items } = await getPosts({ perPage: 30, includeDeleted: true });

  return (
    <div className="px-4 py-5 lg:px-0 lg:py-0">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-title font-bold text-ink">관리자</h1>
        <Badge tone="brand">admin</Badge>
      </div>

      {isSeedMode() && <PendingNotice ticket="Supabase 연결" />}

      <div className="mb-8 rounded-[var(--radius-sm)] bg-surface px-4 py-3 text-[12px] leading-relaxed text-ink-sub">
        <b className="font-bold text-ink">운영 수칙</b> 운영자 계정으로는 서비스
        운영 공지만 게시합니다. 시황 분석·종목 의견은 게시하지 않습니다. 타인
        게시물 삭제는 감사 로그에 기록됩니다.
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-list font-bold text-ink">최근 게시물</h2>
          <Link
            href="/write?category=notice"
            className="text-meta font-semibold text-brand hover:underline"
          >
            공지 작성
          </Link>
        </div>

        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-md)] border border-line">
          {items.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 px-4 py-3 text-meta"
            >
              <span className="w-10 shrink-0 text-ink-sub">{p.id}</span>
              <span className="w-20 shrink-0 truncate text-ink-sub">
                {p.category_name}
              </span>
              <Link
                href={`/c/${p.category_slug}/${p.id}`}
                className="min-w-0 flex-1 truncate font-medium text-ink hover:text-brand"
              >
                {p.title}
              </Link>
              <span className="hidden w-24 shrink-0 truncate text-ink-sub sm:block">
                {p.author_nickname}
              </span>
              <span className="hidden w-14 shrink-0 text-ink-sub sm:block">
                {formatListDate(p.created_at)}
              </span>
              {isSeedMode() ? (
                <button
                  type="button"
                  disabled
                  className="shrink-0 font-semibold text-danger disabled:opacity-40"
                >
                  삭제
                </button>
              ) : (
                <DeleteForm
                  action={deletePostAction}
                  hidden={{ postId: p.id }}
                  confirmMessage="관리자 권한으로 이 글을 삭제합니다. 기록이 남습니다."
                  className="text-meta"
                />
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
