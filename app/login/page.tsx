"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirectTo: "/students", // ให้ NextAuth พาไปหน้านี้เลยเมื่อล็อกอินสำเร็จ (ใช้ redirectTo แทน redirect)
      });

      // ถ้ามาถึงบรรทัดนี้ได้โดยไม่ error แปลว่าล็อกอินผ่าน และกำลังถูก redirect
    } catch (err: any) {
      // ดักจับ Error ที่ NextAuth ขว้าง (throw) ออกมาเมื่อรหัสผิด
      if (err instanceof Error) {
        // NextAuth v5 (Auth.js) มักจะ throw error ที่มีคำว่า CredentialsSignin
        if (err.message.includes("CredentialsSignin")) {
          setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        } else {
          setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
        }
      } else {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
          <p className="mt-1 text-sm text-gray-600">
            กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานระบบจัดการนักศึกษา
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email (อีเมล)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password (รหัสผ่าน)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 p-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "กำลังตรวจสอบข้อมูล..." : "เข้าสู่ระบบ (Login)"}
          </button>
        </form>

        {/* ส่วนนำทางไปหน้าสมัครสมาชิก (Sign Up) */}
        <div className="mt-6 border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-600">
            ยังไม่มีบัญชีผู้ใช้งานใช่ไหม?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
            >
              สมัครสมาชิกที่นี่ (Sign Up)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
