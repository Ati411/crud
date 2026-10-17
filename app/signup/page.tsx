"use client";

import { useActionState } from "react";
import { signupAction, SignupFormState } from "./actions";
import Link from "next/link";

const initialState: SignupFormState = {
  success: false,
};

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">สมัครสมาชิก</h1>
          <p className="mt-1 text-sm text-gray-600">
            สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบลงทะเบียนและจัดการข้อมูลนักศึกษา
          </p>
        </div>

        {/* แสดงข้อความ Error ภาพรวม (เช่น Database ล่ม) */}
        {state.message && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {/* ชื่อ-นามสกุล */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ชื่อ-นามสกุล (Name)
            </label>
            <input
              type="text"
              name="name"
              placeholder="สมชาย ใจดี"
              disabled={isPending}
              required
              className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
            {state.errors?.name && (
              <p className="mt-1 text-xs text-red-500">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* อีเมล */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              อีเมล (Email)
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              disabled={isPending}
              required
              className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
            {state.errors?.email && (
              <p className="mt-1 text-xs text-red-500">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* รหัสผ่าน */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              name="password"
              placeholder="อย่างน้อย 8 ตัวอักษร (ตัวอักษร + ตัวเลข)"
              disabled={isPending}
              required
              className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
            {state.errors?.password && (
              <p className="mt-1 text-xs text-red-500">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* ยืนยันรหัสผ่าน */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ยืนยันรหัสผ่าน (Confirm Password)
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              disabled={isPending}
              required
              className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
            {state.errors?.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-emerald-600 p-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก (Sign Up)"}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-600">
            มีบัญชีผู้ใช้งานอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
            >
              เข้าสู่ระบบที่นี่ (Login)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
