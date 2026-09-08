import { BottomTab } from "@/components/layout/BottomTab";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCategories } from "@/lib/data/queries";

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

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <CategoryNav categories={categories} variant="chips" />

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 gap-6 px-0 lg:px-6">
        <aside className="hidden w-[200px] shrink-0 py-6 lg:block">
          <div className="sticky top-24">
            <CategoryNav categories={categories} variant="sidebar" />
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
