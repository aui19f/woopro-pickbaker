import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "아이디는 3글자 이상이어야 합니다")
  .max(20, "아이디는 20글자 이하여야 합니다")
  .regex(/^[a-z_][a-z0-9_]*$/, "첫 글자는 영문 소문자 또는 _여야 하며, 소문자/숫자/_ 만 사용 가능합니다");

export const loginSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export const signupSchema = z
  .object({
    email: z.string().email("올바른 이메일을 입력해주세요"),
    username: usernameSchema,
    nickname: z.string().optional(),
    password: z.string().min(6, "비밀번호는 6글자 이상이어야 합니다"),
    confirmPassword: z.string(),
    role: z.enum(["USER", "OWNER"]).default("USER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
