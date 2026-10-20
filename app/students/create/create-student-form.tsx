"use client";

import { useActionState } from "react";
import Link from "next/link";
// สังเกตที่ Import: ตัด /app ออก เพื่ออ้างอิงจาก Root แทน
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { FormState } from "../actions";

const initialState: FormState = { success: false };

export default function CreateStudentForm({
  action,
  cancelUrl = "/students",
}: {
  action: any;
  cancelUrl?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="รหัสนักศึกษา"
          name="studentCode"
          placeholder="เช่น 673450000-0"
          error={state.errors?.studentCode?.[0]}
          disabled={isPending}
          required
          maxLength={11}
          pattern="\d{9}-\d{1}"
          title="กรุณากรอกตัวเลข 9 ตัว ตามด้วยเครื่องหมาย - และตัวเลข 1 ตัว (เช่น 673450000-0)"
        />
        <Input
          label="ชื่อ-นามสกุล"
          name="name"
          placeholder="สมชาย เรียนดี"
          error={state.errors?.name?.[0]}
          disabled={isPending}
          required
        />
      </div>

      <Input
        label="Email (อีเมล)"
        name="email"
        type="email"
        placeholder="student@example.com"
        error={state.errors?.email?.[0]}
        disabled={isPending}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="สาขาวิชา"
          name="major"
          placeholder="เช่น Computer Science"
          error={state.errors?.major?.[0]}
          disabled={isPending}
          required
        />
        <Input
          label="ชั้นปี"
          name="year"
          type="number"
          min={1}
          max={4}
          placeholder="1-4"
          error={state.errors?.year?.[0]}
          disabled={isPending}
          required
        />
      </div>

      <div className="mt-8 flex items-center justify-end gap-5 border-t border-slate-200 pt-6">
        <Link
          href={cancelUrl}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          ยกเลิก
        </Link>
        <div className="w-36">
          <Button type="submit" isLoading={isPending} variant="primary">
            บันทึกข้อมูล
          </Button>
        </div>
      </div>
    </form>
  );
}
