"use client";

import { useState, useTransition } from "react";
import { updateStudentStatus } from "@/app/students/actions";
import { useRouter } from "next/navigation";

export default function StatusDropdown({
  studentId,
  currentStatus,
}: {
  studentId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  async function handleStatusChange(newStatus: string) {
    // อัปเดต UI ชั่วคราวให้ดูเหมือนทำงานทันที (Optimistic Update)
    setStatus(newStatus);

    startTransition(async () => {
      try {
        await updateStudentStatus(studentId, newStatus);
        // สั่งให้ Next.js รีโหลดข้อมูลใหม่จาก Server มาทับ
        router.refresh();
      } catch (error) {
        alert("ไม่สามารถเปลี่ยนสถานะได้ กรุณาลองใหม่");
        // ถ้ายิง API พัง ให้สลับสถานะกลับเป็นค่าเดิม
        setStatus(currentStatus);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isPending}
        className={`rounded-md border py-1.5 pl-3 pr-8 text-xs font-semibold focus:outline-none focus:ring-2 disabled:opacity-50 ${
          status === "ACTIVE"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-500 focus:ring-emerald-500/20"
            : status === "GRADUATED"
              ? "border-blue-200 bg-blue-50 text-blue-700 focus:border-blue-500 focus:ring-blue-500/20"
              : status === "DROPPED"
                ? "border-amber-200 bg-amber-50 text-amber-700 focus:border-amber-500 focus:ring-amber-500/20"
                : "border-red-200 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-500/20"
        }`}
      >
        <option value="ACTIVE" className="bg-white text-slate-700">
          กำลังศึกษา
        </option>
        <option value="GRADUATED" className="bg-white text-slate-700">
          จบการศึกษา
        </option>
        <option value="DROPPED" className="bg-white text-slate-700">
          ดรอปเรียน
        </option>
        <option value="SUSPENDED" className="bg-white text-slate-700">
          พ้นสภาพ
        </option>
      </select>

      {isPending && (
        <svg
          className="h-4 w-4 animate-spin text-indigo-500"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      )}
    </div>
  );
}
