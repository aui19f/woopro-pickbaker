"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { signupSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";

export type SignupState = { status: number; message: string } | null;

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const rawUsername = (formData.get("username") as string) ?? "";
  const rawNickname = (formData.get("nickname") as string) ?? "";

  const result = signupSchema.safeParse({
    email: formData.get("email"),
    username: rawUsername,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    nickname: rawNickname || undefined,
    role: formData.get("role") || "USER",
  });

  if (!result.success) {
    return { status: 400, message: result.error.errors[0]?.message ?? "입력값을 확인해주세요." };
  }

  const { email, username, password, role } = result.data;
  const nickname = result.data.nickname || username;

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    return { status: 409, message: "이미 사용 중인 아이디입니다." };
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return { status: 409, message: "이미 사용 중인 이메일입니다." };
  }

  try {
    const supabase = createSupabaseAdminClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, role, status: "ACTIVE" },
    });

    if (authError) {
      if (authError.status && authError.status >= 500) throw authError;
      return { status: 400, message: authError.message };
    }

    if (!authData.user) throw new Error("유저 생성 실패");

    await prisma.user.create({
      data: {
        auth_id: authData.user.id,
        email,
        username,
        nickname,
        role,
      },
    });
  } catch (error) {
    console.error("signupAction error:", error);
    return { status: 500, message: "회원가입 중 오류가 발생했습니다." };
  }

  redirect("/login");
}
