"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function SearchAndFilter({ majors }: { majors: string[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  // 1. ใช้ State เก็บค่าที่กำลังพิมพ์
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("query")?.toString() || "",
  );

  // 2. ใช้ useEffect ดักจับเมื่อพิมพ์เสร็จ (หยุดพิมพ์ 0.5 วิ ถึงจะทำงาน)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set("query", searchTerm);
      } else {
        params.delete("query");
      }

      // เช็กก่อนว่าค่าเปลี่ยนจริงไหม ถึงจะสั่ง replace URL
      const currentQuery = searchParams.get("query") || "";
      if (currentQuery !== searchTerm) {
        startTransition(() => {
          replace(`${pathname}?${params.toString()}`);
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId); // เคลียร์ขยะทิ้งถ้ายังพิมพ์ไม่เสร็จ
  }, [searchTerm, pathname, replace, searchParams]);

  const handleFilter = (major: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (major) {
      params.set("major", major);
    } else {
      params.delete("major");
    }
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="ค้นหาชื่อ หรือ รหัสนักศึกษา..."
          value={searchTerm} // ผูกกับ State แทน defaultValue
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2.5 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="w-full sm:w-64">
        <select
          className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          defaultValue={searchParams.get("major")?.toString() || ""}
          onChange={(e) => handleFilter(e.target.value)}
        >
          <option value="">ทุกสาขาวิชา</option>
          {majors.map((major) => (
            <option key={major} value={major}>
              {major}
            </option>
          ))}
        </select>
      </div>

      {isPending && (
        <span className="text-sm font-medium text-blue-600">กำลังค้นหา...</span>
      )}
    </div>
  );
}
