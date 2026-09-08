import { NotFoundView } from "@/components/ui/NotFoundView";

export const metadata = { title: "페이지를 찾을 수 없습니다" };

/** 앱 밖(잘못된 주소 직접 입력) 404 — 헤더 없이 조용히 */
export default function NotFound() {
  return <NotFoundView />;
}
