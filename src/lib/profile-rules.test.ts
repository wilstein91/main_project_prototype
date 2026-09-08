import { describe, expect, it } from "vitest";
import {
  NICKNAME_COOLDOWN_DAYS,
  nicknameChangeAvailableAt,
} from "./profile-rules";

describe("닉네임 변경 쿨다운 (F-106)", () => {
  const now = new Date("2026-09-08T12:00:00+09:00");

  it("한 번도 바꾸지 않았으면 바로 가능하다", () => {
    expect(nicknameChangeAvailableAt(null, now)).toBeNull();
  });

  it("쿨다운 중이면 다시 가능해지는 시각을 돌려준다", () => {
    const changed = new Date(now);
    changed.setDate(changed.getDate() - 1); // 어제 변경
    const next = nicknameChangeAvailableAt(changed.toISOString(), now);
    expect(next).not.toBeNull();
    expect(next!.getTime()).toBeGreaterThan(now.getTime());
  });

  it("쿨다운이 지났으면 null 이다", () => {
    const changed = new Date(now);
    changed.setDate(changed.getDate() - (NICKNAME_COOLDOWN_DAYS + 1));
    expect(nicknameChangeAvailableAt(changed.toISOString(), now)).toBeNull();
  });

  it("경계: 정확히 30일 전이면 가능하다", () => {
    const changed = new Date(now);
    changed.setDate(changed.getDate() - NICKNAME_COOLDOWN_DAYS);
    expect(nicknameChangeAvailableAt(changed.toISOString(), now)).toBeNull();
  });
});
