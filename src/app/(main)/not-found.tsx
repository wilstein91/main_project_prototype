import { NotFoundView } from "@/components/ui/NotFoundView";

export const metadata = { title: "페이지를 찾을 수 없습니다" };

/**
 * 앱 안쪽 404 — 헤더와 카테고리 줄을 유지한다.
 * 삭제된 글을 눌러 여기 온 사람이 목록으로 바로 돌아갈 수 있어야 한다.
 */
export default function MainNotFound() {
  return <NotFoundView inApp />;
}
