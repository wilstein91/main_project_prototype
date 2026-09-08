"use client";

import { useEffect, useRef } from "react";
import { recordViewAction } from "@/lib/actions/post";

/**
 * 조회수 집계 (F-208).
 *
 * 서버 렌더 중에는 쿠키를 쓸 수 없어서 중복 방지 상태를 저장할 곳이
 * 없다. 그래서 마운트 시 Server Action 을 한 번 호출하는 형태로 둔다.
 * 중복 판정과 쿠키 기록은 액션이 서버에서 처리한다.
 *
 * 화면에 아무것도 그리지 않는다. 실패해도 조용히 넘긴다 — 조회수 때문에
 * 글이 안 보이면 안 된다.
 */
export function ViewCounter({ postId }: { postId: number }) {
  const done = useRef(false);

  useEffect(() => {
    // 개발 모드의 이중 마운트에서 두 번 호출되지 않게 한다
    if (done.current) return;
    done.current = true;
    void recordViewAction(postId).catch(() => {});
  }, [postId]);

  return null;
}
