"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";

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
        redirectTo: "/",
      });
    } catch (err: any) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            เข้าสู่ระบบ
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานระบบ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email (อีเมล)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isLoading}
            required
          />
          <Input
            label="Password (รหัสผ่าน)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            required
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full">
            เข้าสู่ระบบ
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="mx-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            OR
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={isLoading}
          onClick={() => {
            setIsLoading(true);
            signIn("github", { callbackUrl: "/" });
          }}
        >
          เข้าสู่ระบบด้วย GitHub
        </Button>

        <div className="mt-8 text-center text-sm text-slate-600">
          ยังไม่มีบัญชีผู้ใช้งานใช่ไหม?{" "}
          <Link
            href="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            สมัครสมาชิกที่นี่
          </Link>
        </div>
      </div>
    </div>
  );
}
