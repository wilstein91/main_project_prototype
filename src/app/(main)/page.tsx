import { HomeHero } from "@/components/brand/HomeHero";
import { PostList } from "@/components/post/PostList";
import { ButtonLink } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import { COMPANY } from "@/config/company";
import { getPosts } from "@/lib/data/queries";
import { getViewer } from "@/lib/session";

/** 홈 — 전체 카테고리 통합 최신글 피드 (F-202) */
export default async function HomePage() {
  const [{ items }, viewer] = await Promise.all([getPosts(), getViewer()]);

  // 띠가 보일 때는 그 안의 문장이 이 화면의 제목이다. 띠가 없으면
  // '최신글' 이 제목이 된다 — 화면마다 h1 이 하나여야 한다.
  const Heading = viewer ? "h1" : "h2";

  return (
    <div>
      {/* 처음 온 사람에게만 여기가 어떤 곳인지 알려준다 */}
      {!viewer && <HomeHero />}

      <div
        className={`lg:border lg:border-line lg:bg-canvas ${
          viewer
            ? "lg:rounded-[var(--radius-md)]"
            : "lg:rounded-b-[var(--radius-md)] lg:border-t-0"
        }`}
      >
        <div className="border-b border-line px-4 py-4 lg:px-6">
          <Heading className="text-title font-bold text-ink">최신글</Heading>
          {/* 띠가 이미 같은 말을 했으면 반복하지 않는다 */}
          {viewer && (
            <p className="mt-0.5 text-meta text-ink-sub">{COMPANY.tagline}</p>
          )}
        </div>

        {items.length === 0 ? (
          <Empty
            title="아직 글이 없습니다"
            description="첫 글을 남겨보세요."
            action={<ButtonLink href="/write">글쓰기</ButtonLink>}
          />
        ) : (
          <PostList posts={items} showCategory />
        )}
      </div>
    </div>
  );
}
