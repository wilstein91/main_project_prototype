const KST = "Asia/Seoul";

/**
 * 목록용 표기 — 오늘이면 시각, 올해면 월/일, 그 외에는 연도까지.
 * 상대 시간("3분 전")은 서버·클라이언트 시각 차이로 하이드레이션이
 * 어긋나기 쉬워 목록에서는 쓰지 않는다.
 */
/** KST 기준 연/월/일을 뽑는다 (서버·클라이언트 시간대 차이 방지) */
function kstParts(d: Date) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)!.value;
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function formatListDate(iso: string, now = new Date()): string {
  const a = kstParts(new Date(iso));
  const b = kstParts(now);

  if (a.year === b.year && a.month === b.month && a.day === b.day) {
    return `${a.hour}:${a.minute}`;
  }
  if (a.year === b.year) return `${a.month}.${a.day}`;
  return `${a.year.slice(2)}.${a.month}.${a.day}`;
}

/** 상세용 표기 — 전체 일시 */
export function formatFullDate(iso: string): string {
  const p = kstParts(new Date(iso));
  return `${p.year}.${p.month}.${p.day} ${p.hour}:${p.minute}`;
}

export function formatCount(n: number): string {
  return n.toLocaleString("ko-KR");
}
