import { BottomTab } from "@/components/layout/BottomTab";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { DevAuthBanner } from "@/components/layout/DevAuthBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCategories } from "@/lib/data/queries";
import { artwork } from "@/lib/art";

/**
 * 커뮤니티 셸 — PRD §6.1
 *
 *   PC(≥1024px)  헤더 + 좌측 고정 사이드바 + 본문
 *   모바일(<768) 앱바 + 가로 스크롤 칩 + 본문 + 하단 탭
 *
 * 같은 데이터를 다른 배치로 보여주는 동일 서비스다.
 * 모바일 전용 코드베이스를 만들지 않는다.
 *
 * 커뮤니티 트랙이므로 gate() 를 호출하지 않는다 (TECH_SPEC §9.6).
 */
export default async function MainLayout({ children }: LayoutProps<"/">) {
  const categories = await getCategories();

  /*
   * 카테고리 그림. 클라이언트 컴포넌트인 CategoryNav 는 파일 시스템을
   * 볼 수 없으므로 여기서 찾아 넘긴다.
   */
  const categoryArt = Object.fromEntries(
    [["", "all"], ...categories.map((c) => [c.slug, c.slug])].map(
      ([slug, file]) => [slug, artwork(`cat-${file}`)],
    ),
  );

  /*
   * 본문(1200px)보다 넓은 화면에서 남는 양옆을 성벽 그림으로 채운다.
   * PC 에서만 쓴다 (모바일은 여백이 없다).
   * 파일이 없으면 아무것도 그리지 않는다 (DESIGN.md §10.9).
   *
   * CSS 변수로 넘기려다 한 번 틀렸다 — `body::before` 는 **body 의**
   * 변수를 보는데 변수를 자식 div 에 걸었으니 보일 리가 없었다. 상속은
   * 위에서 아래로만 흐른다. 그래서 배경을 요소로 직접 그린다.
   */
  const left = artwork("side-left");
  const right = artwork("side-right");
  const sides = [left, right].filter(Boolean) as string[];

  return (
    <div className="flex min-h-full flex-col">
      {sides.length > 0 && (
        <div
          aria-hidden
          /*
           * 모바일에서는 끈다. 본문이 화면을 꽉 채워 여백이 없으므로
           * 배경이 목록 뒤로 비쳐 글을 방해하기만 한다.
           */
          className="pointer-events-none fixed inset-0 -z-10 hidden opacity-85 lg:block"
          style={{
            backgroundImage: sides.map((u) => `url(${u})`).join(", "),
            backgroundRepeat: sides.map(() => "no-repeat").join(", "),
            backgroundPosition:
              sides.length > 1 ? "left center, right center" : "left center",
            backgroundSize: sides.map(() => "auto 100%").join(", "),
          }}
        />
      )}
      <DevAuthBanner />
      <Header />
      <CategoryNav categories={categories} variant="chips" art={categoryArt} />

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 gap-6 px-0 lg:px-6">
        <aside className="hidden w-[200px] shrink-0 py-6 lg:block">
          <div className="sticky top-[120px]">
            <CategoryNav categories={categories} variant="sidebar" art={categoryArt} />
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-20 lg:py-6 lg:pb-10">
          {children}
        </main>
      </div>

      <Footer />
      <BottomTab />
    </div>
  );
}
