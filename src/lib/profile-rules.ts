// ─────────────────────────────────────────────────────────────
// 프로필 규칙 — 순수 함수만 둔다.
//
// "use server" 모듈은 모든 export 가 async 함수여야 하므로,
// 상수와 동기 헬퍼는 액션 파일에 둘 수 없다.
// ─────────────────────────────────────────────────────────────

/** 닉네임 변경 제한 (F-106) */
export const NICKNAME_COOLDOWN_DAYS = 30;

/**
 * 다시 변경할 수 있게 되는 시각. 이미 가능하면 null.
 * 서버·클라이언트 양쪽에서 쓰므로 순수 함수로 유지한다.
 */
export function nicknameChangeAvailableAt(
  changedAt: string | null,
  now = new Date(),
): Date | null {
  if (!changedAt) return null;
  const next = new Date(changedAt);
  next.setDate(next.getDate() + NICKNAME_COOLDOWN_DAYS);
  return next > now ? next : null;
}

export function formatKstDate(d: Date): string {
  return d.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
}
