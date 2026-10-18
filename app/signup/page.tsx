"use client";

import { useActionState } from "react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { signupAction, SignupFormState } from "./actions";

const initialState: SignupFormState = { success: false };

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            สมัครสมาชิก
          </h1>
        </div>

        {state.message && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <Input
            label="ชื่อ-นามสกุล"
            name="name"
            placeholder="สมชาย ใจดี"
            error={state.errors?.name?.[0]}
            disabled={isPending}
            required
          />
          <Input
            label="อีเมล"
            name="email"
            type="email"
            placeholder="you@example.com"
            error={state.errors?.email?.[0]}
            disabled={isPending}
            required
          />
          <Input
            label="รหัสผ่าน"
            name="password"
            type="password"
            placeholder="อย่างน้อย 6 ตัวอักษร"
            error={state.errors?.password?.[0]}
            disabled={isPending}
            required
          />
          <Input
            label="ยืนยันรหัสผ่าน"
            name="confirmPassword"
            type="password"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            error={state.errors?.confirmPassword?.[0]}
            disabled={isPending}
            required
          />

          <Button type="submit" isLoading={isPending} className="w-full">
            สร้างบัญชี
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
