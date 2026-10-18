import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  colorTheme: "indigo" | "emerald" | "blue" | "amber" | "red";
}

export default function StatCard({
  title,
  value,
  unit,
  icon,
  colorTheme,
}: StatCardProps) {
  // สร้างตัวแปรจัดการสีพื้นหลังและสีไอคอนตาม Theme ที่ส่งเข้ามา
  const themeStyles = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${themeStyles[colorTheme]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">
            {value}{" "}
            <span className="text-sm font-normal text-slate-500">{unit}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
