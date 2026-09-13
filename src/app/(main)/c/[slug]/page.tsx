import { notFound } from "next/navigation";
import Link from "next/link";
import { PostList } from "@/components/post/PostList";
import { ButtonLink } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import { artwork } from "@/lib/art";
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

  const banner = artwork(`cat-${category.slug}`);
  const page = Math.max(1, Number(pageParam ?? 1) || 1);
  const { items, total } = await getPosts({ categoryId: category.id, page });
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <div className="lg:panel">
      <div className="relative flex items-end justify-between gap-3 overflow-hidden border-b border-gold-dim px-4 py-5 lg:px-6 lg:py-6">
        {/* 그 게시판을 그린 배너. 그림이 없으면 평소의 어두운 머리다 */}
        {banner && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,8,4,0.93)_0%,rgba(12,8,4,0.72)_55%,rgba(12,8,4,0.45)_100%)]"
            />
          </>
        )}
        <div className="relative min-w-0">
          <h1 className="serif title-mark text-[24px] font-bold text-gold-lit drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-1 text-meta text-ink-sub drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {category.description}
            </p>
          )}
        </div>
        {category.write_role === "user" && (
          <ButtonLink
            href={`/write?category=${category.slug}`}
            size="sm"
            className="relative hidden shrink-0 lg:inline-flex"
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
