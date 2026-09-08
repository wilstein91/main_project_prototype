import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// 입력 검증 — 모든 Server Action 은 서버에서 이 스키마로 재검증한다.
// 클라이언트 검증은 UX 용이며 신뢰하지 않는다 (TECH_SPEC §6).
// zod 4 API 를 쓴다 (z.email() — z.string().email() 은 구형).
// ─────────────────────────────────────────────────────────────

/** 닉네임 2~12자, 한글·영문·숫자 (F-105) */
export const nicknameSchema = z
  .string()
  .trim()
  .min(2, "닉네임은 2자 이상이어야 합니다.")
  .max(12, "닉네임은 12자 이하여야 합니다.")
  .regex(
    /^[가-힣a-zA-Z0-9]+$/,
    "닉네임은 한글·영문·숫자만 사용할 수 있습니다.",
  );

/** 10자 이상 + 영문·숫자·특수문자 중 2종 이상 (TECH_SPEC §5.3) */
export const passwordSchema = z
  .string()
  .min(10, "비밀번호는 10자 이상이어야 합니다.")
  .max(72, "비밀번호는 72자 이하여야 합니다.")
  .refine((v) => {
    const kinds = [/[a-zA-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) =>
      re.test(v),
    ).length;
    return kinds >= 2;
  }, "영문·숫자·특수문자 중 2종 이상을 조합하세요.");

export const emailSchema = z
  .email("이메일 형식이 올바르지 않습니다.")
  .max(254);

/** 체크박스는 문자열 "on" 으로 넘어온다 */
const requiredAgreement = (label: string) =>
  z.literal("on", { error: `${label}에 동의해야 가입할 수 있습니다.` });

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nickname: nicknameSchema,
  terms: requiredAgreement("이용약관"),
  privacy: requiredAgreement("개인정보 수집 및 이용"),
  disclaimer: requiredAgreement("투자 유의사항"),
  marketing: z.literal("on").optional(),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "비밀번호를 입력하세요."),
  redirect: z.string().optional(),
});

export const resetRequestSchema = z.object({ email: emailSchema });

export const updatePasswordSchema = z.object({ password: passwordSchema });

export const updateNicknameSchema = z.object({ nickname: nicknameSchema });

export const postSchema = z.object({
  categoryId: z.coerce.number().int().positive("카테고리를 선택하세요."),
  title: z
    .string()
    .trim()
    .min(1, "제목을 입력하세요.")
    .max(100, "제목은 100자 이하여야 합니다."),
  content: z
    .string()
    .trim()
    .min(1, "내용을 입력하세요.")
    .max(20000, "본문은 20,000자 이하여야 합니다."),
});

export const postUpdateSchema = postSchema.omit({ categoryId: true }).extend({
  postId: z.coerce.number().int().positive(),
});

export const commentSchema = z.object({
  postId: z.coerce.number().int().positive(),
  parentId: z.coerce.number().int().positive().optional(),
  content: z
    .string()
    .trim()
    .min(1, "내용을 입력하세요.")
    .max(1000, "댓글은 1,000자 이하여야 합니다."),
});

export const commentUpdateSchema = z.object({
  commentId: z.coerce.number().int().positive(),
  content: commentSchema.shape.content,
});

export const idSchema = z.coerce.number().int().positive();
