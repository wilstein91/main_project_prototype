import { PostList } from "@/components/post/PostList";
import { ButtonLink } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import { COMPANY } from "@/config/company";
import { getPosts } from "@/lib/data/queries";

/** 홈 — 전체 카테고리 통합 최신글 피드 (F-202) */
export default async function HomePage() {
  const { items } = await getPosts();

  return (
    <div className="lg:rounded-[var(--radius-md)] lg:border lg:border-line lg:bg-canvas">
      <div className="border-b border-line px-4 py-4 lg:px-5">
        <h1 className="text-title font-bold text-ink">최신글</h1>
        <p className="mt-0.5 text-meta text-ink-sub">{COMPANY.tagline}</p>
      </div>

      {items.length === 0 ? (
        <Empty
          title="아직 글이 없습니다"
          description="첫 글을 남기면 이곳에 표시됩니다."
          action={<ButtonLink href="/write">글쓰기</ButtonLink>}
        />
      ) : (
        <PostList posts={items} showCategory />
      )}
    </div>
  );
}
