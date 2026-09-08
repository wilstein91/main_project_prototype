import { describe, expect, it } from "vitest";
import {
  commentSchema,
  nicknameSchema,
  passwordSchema,
  postSchema,
  signUpSchema,
} from "./schemas";

describe("nicknameSchema (F-105)", () => {
  it("2~12자 한글·영문·숫자를 통과시킨다", () => {
    for (const v of ["운영자", "ab", "달러사냥꾼", "abc123", "가나다라마바사아자차카"]) {
      expect(nicknameSchema.safeParse(v).success, v).toBe(true);
    }
  });

  it("너무 짧거나 길면 거부한다", () => {
    expect(nicknameSchema.safeParse("가").success).toBe(false);
    expect(nicknameSchema.safeParse("가나다라마바사아자차카타파").success).toBe(false); // 13자
  });

  it("공백·특수문자·이모지를 거부한다", () => {
    for (const v of ["운영 자", "admin!", "a_b", "닉네임😀", "  "]) {
      expect(nicknameSchema.safeParse(v).success, v).toBe(false);
    }
  });

  it("앞뒤 공백은 잘라낸 뒤 판정한다", () => {
    const r = nicknameSchema.safeParse("  운영자  ");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("운영자");
  });
});

describe("passwordSchema (TECH_SPEC §5.3)", () => {
  it("10자 이상 + 2종 조합을 통과시킨다", () => {
    for (const v of ["abcdefgh12", "Password123", "abcdefghi!", "1234567890!"]) {
      expect(passwordSchema.safeParse(v).success, v).toBe(true);
    }
  });

  it("10자 미만을 거부한다", () => {
    expect(passwordSchema.safeParse("abc123!").success).toBe(false);
  });

  it("한 종류만 쓴 비밀번호를 거부한다", () => {
    expect(passwordSchema.safeParse("abcdefghijkl").success).toBe(false);
    expect(passwordSchema.safeParse("123456789012").success).toBe(false);
  });
});

describe("signUpSchema (F-102)", () => {
  const base = {
    email: "a@b.com",
    password: "abcdefgh12",
    nickname: "홍길동",
    terms: "on",
    privacy: "on",
    disclaimer: "on",
  };

  it("필수 동의 3종이 모두 있으면 통과한다", () => {
    expect(signUpSchema.safeParse(base).success).toBe(true);
  });

  it("필수 동의가 하나라도 빠지면 거부한다", () => {
    for (const k of ["terms", "privacy", "disclaimer"] as const) {
      const input = { ...base };
      delete input[k];
      expect(signUpSchema.safeParse(input).success, k).toBe(false);
    }
  });

  it("마케팅 동의는 없어도 통과한다", () => {
    expect(signUpSchema.safeParse({ ...base, marketing: undefined }).success).toBe(true);
  });

  it("이메일 형식을 검사한다", () => {
    expect(signUpSchema.safeParse({ ...base, email: "not-an-email" }).success).toBe(false);
  });
});

describe("postSchema (F-205 / F-209)", () => {
  const base = { categoryId: "2", title: "제목", content: "내용" };

  it("체크박스가 없으면 isPinned 는 false 다", () => {
    const r = postSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.isPinned).toBe(false);
  });

  it("체크박스가 'on' 이면 isPinned 는 true 다", () => {
    const r = postSchema.safeParse({ ...base, isPinned: "on" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.isPinned).toBe(true);
  });

  it("categoryId 를 숫자로 변환한다", () => {
    const r = postSchema.safeParse(base);
    if (r.success) expect(r.data.categoryId).toBe(2);
  });

  it("제목 100자·본문 20000자 초과를 거부한다", () => {
    expect(postSchema.safeParse({ ...base, title: "가".repeat(101) }).success).toBe(false);
    expect(postSchema.safeParse({ ...base, content: "가".repeat(20001) }).success).toBe(false);
  });

  it("빈 제목·본문을 거부한다", () => {
    expect(postSchema.safeParse({ ...base, title: "   " }).success).toBe(false);
    expect(postSchema.safeParse({ ...base, content: "" }).success).toBe(false);
  });
});

describe("commentSchema (F-301 / F-302)", () => {
  it("parentId 없이 최상위 댓글을 만든다", () => {
    const r = commentSchema.safeParse({ postId: "4", content: "댓글" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.parentId).toBeUndefined();
  });

  it("parentId 가 있으면 답글이 된다", () => {
    const r = commentSchema.safeParse({ postId: "4", parentId: "1", content: "답글" });
    if (r.success) expect(r.data.parentId).toBe(1);
  });

  it("1000자를 넘으면 거부한다", () => {
    expect(
      commentSchema.safeParse({ postId: "4", content: "가".repeat(1001) }).success,
    ).toBe(false);
  });
});
