import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatCount, formatListDate } from "@/lib/utils/date";
import type { PostListItem } from "@/types/db";

/**
 * 글 목록 — 표시 항목은 F-203 (제목, 닉네임, 시각, 댓글 수, 조회수).
 *
 * ## 왜 다시 짰나 (DESIGN.md §5)
 *
 * 처음에는 부가 정보를 한 줄에 이어 붙이고 가운뎃점으로 끊었다.
 * `카테고리 · 닉네임 · 3.14 · 조회 1,893` — 항목이 네 개인데 구분자가
 * 셋이라 눈이 점을 세게 되고, 정작 훑어 읽어야 하는 제목보다 이 줄이
 * 시끄러웠다. 시드 26건을 넣고 나서야 보였다.
 *
 * 세 가지를 바꿨다.
 *
 * 1. 구분자를 없애고 여백과 굵기로 나눈다. 닉네임은 medium, 시각은
 *    regular. 점 세 개가 사라지면 줄이 조용해진다.
 * 2. 숫자는 오른쪽 고정 열에 세로로 쌓고 tabular-nums 로 자리를 맞춘다.
 *    행마다 숫자 위치가 같아야 세로로 훑어 읽힌다. 글자 폭이 들쭉날쭉하면
 *    그게 안 된다.
 * 3. 카테고리는 전체 피드에서만 보인다. 카테고리 안에 들어와서 보는
 *    목록에 그 카테고리 이름을 매 행 반복하는 것은 정보가 아니다.
 *
 * 조회수는 PC 에서만 보인다. 모바일에서 한 행에 숫자 두 개를 넣으면
 * 제목 폭을 먹는데, 조회수는 그만한 값을 하지 않는다.
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
            className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-surface lg:gap-4 lg:px-6"
          >
            <div className="min-w-0 flex-1">
              <h3 className="flex items-start gap-1.5 text-list font-semibold leading-snug text-ink">
                {p.is_pinned && (
                  <span className="mt-px shrink-0">
                    <Badge tone="brand">공지</Badge>
                  </span>
                )}
                <span className="line-clamp-2">{p.title}</span>
              </h3>

              {/* 구분자 없이 여백과 굵기로만 나눈다 */}
              <p className="mt-1.5 flex items-center gap-2.5 text-meta text-ink-sub">
                {showCategory && (
                  <span className="shrink-0 font-semibold text-brand">
                    {p.category_name}
                  </span>
                )}
                <span className="truncate font-medium">
                  {p.author_nickname}
                </span>
                <span className="shrink-0">
                  {formatListDate(p.created_at)}
                </span>
              </p>
            </div>

            {/*
             * 숫자 열 — 폭을 고정한다. 댓글이 없는 행에서도 열이 접히지
             * 않아야 제목 시작점이 행마다 같다.
             */}
            <div className="w-8 shrink-0 text-right leading-tight lg:w-12">
              {p.comment_count > 0 && (
                <span className="nums block text-meta font-bold text-brand">
                  <span className="sr-only">댓글 </span>
                  {formatCount(p.comment_count)}
                </span>
              )}
              <span className="nums mt-0.5 hidden text-fine text-ink-sub lg:block">
                <span className="sr-only">조회 </span>
                {formatCount(p.view_count)}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
