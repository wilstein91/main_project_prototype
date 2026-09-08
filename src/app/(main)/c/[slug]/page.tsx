import { notFound } from "next/navigation";
import Link from "next/link";
import { PostList } from "@/components/post/PostList";
import { ButtonLink } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import {
  getCategoryBySlug,
  getPosts,
  POSTS_PER_PAGE,
} from "@/lib/data/queries";

export async function generateMetadata({ params }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

/** 카테고리별 글 목록 (F-202) — 오프셋 페이지네이션 20건 */
export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(pageParam ?? 1) || 1);
  const { items, total } = await getPosts({ categoryId: category.id, page });
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <div className="lg:rounded-[var(--radius-md)] lg:border lg:border-line lg:bg-canvas">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4 lg:px-6">
        <div className="min-w-0">
          <h1 className="text-title font-bold text-ink">{category.name}</h1>
          {category.description && (
            <p className="mt-0.5 text-meta text-ink-sub">
              {category.description}
            </p>
          )}
        </div>
        {category.write_role === "user" && (
          <ButtonLink
            href={`/write?category=${category.slug}`}
            size="sm"
            className="hidden shrink-0 lg:inline-flex"
          >
            글쓰기
          </ButtonLink>
        )}
      </div>

      {items.length === 0 ? (
        <Empty
          title="아직 글이 없습니다"
          description={
            category.write_role === "admin"
              ? "이 게시판에는 운영자만 글을 쓸 수 있습니다."
              : "첫 글을 남겨보세요."
          }
          action={
            category.write_role === "user" ? (
              <ButtonLink href={`/write?category=${category.slug}`}>
                글쓰기
              </ButtonLink>
            ) : undefined
          }
        />
      ) : (
        <>
          <PostList posts={items} />
          <Pagination slug={slug} page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}

function Pagination({
  slug,
  page,
  totalPages,
}: {
  slug: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="페이지"
      className="flex items-center justify-center gap-1 border-t border-line py-4"
    >
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={n === 1 ? `/c/${slug}` : `/c/${slug}?page=${n}`}
          aria-current={n === page ? "page" : undefined}
          className={`tap flex items-center justify-center rounded-[var(--radius-sm)] px-3 text-list font-semibold ${
            n === page
              ? "bg-brand-soft text-brand"
              : "text-ink-sub hover:bg-surface"
          }`}
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}
