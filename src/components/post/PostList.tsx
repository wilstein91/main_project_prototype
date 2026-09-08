import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatCount, formatListDate } from "@/lib/utils/date";
import type { PostListItem } from "@/types/db";

/**
 * 글 목록 — 표시 항목은 F-203 (제목, 닉네임, 시각, 댓글 수, 조회수).
 * 선을 최소화하고 여백으로 행을 구분한다 (TECH_SPEC §8.1).
 */
export function PostList({
  posts,
  showCategory = false,
}: {
  posts: PostListItem[];
  showCategory?: boolean;
}) {
  return (
    <ul className="divide-y divide-line">
      {posts.map((p) => (
        <li key={p.id}>
          <Link
            href={`/c/${p.category_slug}/${p.id}`}
            className="block px-4 py-3.5 transition-colors hover:bg-surface lg:px-5"
          >
            <div className="flex items-start gap-2">
              {p.is_pinned && <Badge tone="brand">공지</Badge>}
              <h3 className="min-w-0 flex-1 text-list font-semibold leading-snug text-ink">
                <span className="line-clamp-2">{p.title}</span>
              </h3>
              {p.comment_count > 0 && (
                <span className="shrink-0 text-meta font-bold text-brand">
                  {formatCount(p.comment_count)}
                </span>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-ink-sub">
              {showCategory && (
                <>
                  <span className="font-medium text-ink-sub">
                    {p.category_name}
                  </span>
                  <Dot />
                </>
              )}
              <span>{p.author_nickname}</span>
              <Dot />
              <span>{formatListDate(p.created_at)}</span>
              <Dot />
              <span>조회 {formatCount(p.view_count)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Dot() {
  return <span aria-hidden className="text-line">·</span>;
}
