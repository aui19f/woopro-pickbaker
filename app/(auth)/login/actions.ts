"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";

export type LoginState = { status: number; message: string } | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const result = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { status: 400, message: result.error.errors[0]?.message ?? "입력값을 확인해주세요." };
  }

  const { username, password } = result.data;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { status: 401, message: "아이디 또는 비밀번호가 틀렸습니다." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email: user.email, password });

    if (error) {
      if (error.status && error.status >= 500) throw error;
      return { status: 401, message: "아이디 또는 비밀번호가 틀렸습니다." };
    }
  } catch (error) {
    console.error("loginAction error:", error);
    return { status: 500, message: "로그인 중 오류가 발생했습니다." };
  }

  redirect(`/${username}`);
}
