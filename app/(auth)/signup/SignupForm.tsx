"use client";

import { startTransition, useActionState, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { signupAction } from "./actions";
import { signupSchema } from "@/lib/validations/auth";

type FieldErrors = Partial<Record<"username" | "password" | "confirmPassword" | "email", string>>;

const FIELDS = ["username", "password", "confirmPassword", "email"] as const;
type Field = (typeof FIELDS)[number];

export default function SignupForm() {
  const [state, dispatch, isPending] = useActionState(signupAction, null);
  const [role, setRole] = useState<"USER" | "OWNER">("USER");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const refs: Record<Field, React.RefObject<HTMLInputElement | null>> = {
    username: usernameRef,
    password: passwordRef,
    confirmPassword: confirmPasswordRef,
    email: emailRef,
  };

  const getValues = () => ({
    username: usernameRef.current?.value ?? "",
    password: passwordRef.current?.value ?? "",
    confirmPassword: confirmPasswordRef.current?.value ?? "",
    email: emailRef.current?.value ?? "",
  });

  const validate = useCallback(
    (values: ReturnType<typeof getValues>): FieldErrors => {
      const result = signupSchema.safeParse({ ...values, role });
      if (result.success) return {};
      const errs: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as Field;
        if (field && !errs[field]) errs[field] = issue.message;
      }
      return errs;
    },
    [role],
  );

  const handleBlur = (field: Field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate(getValues());
    setErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const errs = validate(getValues());

    setTouched({ username: true, password: true, confirmPassword: true, email: true });
    setErrors(errs);

    const firstInvalid = FIELDS.find((f) => errs[f]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus();
      return;
    }

    startTransition(() => dispatch(formData));
  };

  const inputClass = (field: Field) =>
    `w-full h-12 px-4 rounded-xl bg-white border text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:border-point transition-colors ${
      touched[field] && errors[field] ? "border-red-400" : "border-stone-200"
    }`;

  const baseInputClass =
    "w-full h-12 px-4 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:border-point transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* 아이디 */}
      <div>
        <input
          ref={usernameRef}
          name="username"
          type="text"
          placeholder="아이디 (영문 소문자로 시작, 최대 20자)"
          autoCapitalize="none"
          autoComplete="username"
          maxLength={20}
          onChange={(e) => { e.target.value = e.target.value.toLowerCase(); }}
          onBlur={() => handleBlur("username")}
          className={inputClass("username")}
        />
        {touched.username && errors.username && (
          <p className="text-xs text-red-400 mt-1 px-1">{errors.username}</p>
        )}
      </div>

      {/* 비밀번호 */}
      <div>
        <input
          ref={passwordRef}
          name="password"
          type="password"
          placeholder="비밀번호 (6글자 이상)"
          autoComplete="new-password"
          onBlur={() => handleBlur("password")}
          className={inputClass("password")}
        />
        {touched.password && errors.password && (
          <p className="text-xs text-red-400 mt-1 px-1">{errors.password}</p>
        )}
      </div>

      {/* 비밀번호 확인 */}
      <div>
        <input
          ref={confirmPasswordRef}
          name="confirmPassword"
          type="password"
          placeholder="비밀번호 확인"
          autoComplete="new-password"
          onBlur={() => handleBlur("confirmPassword")}
          className={inputClass("confirmPassword")}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <p className="text-xs text-red-400 mt-1 px-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* 이메일 */}
      <div>
        <input
          ref={emailRef}
          name="email"
          type="email"
          placeholder="이메일"
          autoComplete="email"
          onBlur={() => handleBlur("email")}
          className={inputClass("email")}
        />
        {touched.email && errors.email && (
          <p className="text-xs text-red-400 mt-1 px-1">{errors.email}</p>
        )}
      </div>

      {/* 닉네임 */}
      <input
        name="nickname"
        type="text"
        placeholder="닉네임 (비워두면 아이디로 저장)"
        autoComplete="nickname"
        className={baseInputClass}
      />

      {/* 역할 선택 */}
      <input type="hidden" name="role" value={role} />
      <div className="flex gap-2">
        {(["USER", "OWNER"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 h-11 rounded-xl border text-sm font-medium transition-colors ${
              role === r
                ? "border-point text-point bg-point/5"
                : "border-stone-200 text-stone-400"
            }`}
          >
            {r === "USER" ? "일반" : "사업자"}
          </button>
        ))}
      </div>

      {state?.message && (
        <p className="text-xs text-red-400 px-1">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-xl bg-point text-white text-sm font-semibold mt-1 disabled:opacity-60 transition-opacity"
      >
        {isPending ? "가입 중..." : "회원가입"}
      </button>

      <p className="text-center text-xs text-stone-400 mt-2">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-point font-medium">
          로그인
        </Link>
      </p>
    </form>
  );
}
