import CreateStudentForm from "./create-student-form";
import { createStudent } from "../actions";
import { auth } from "@/app/auth";

export default async function CreateStudentPage() {
  const session = await auth();
  const cancelUrl = session?.user?.role === "ADMIN" ? "/admin" : "/students"; // <--- กำหนด URL
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            เพิ่มข้อมูลนักศึกษา
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            สร้างโปรไฟล์นักศึกษาใหม่เข้าสู่ระบบ
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* โยน cancelUrl ลงไปในฟอร์ม */}
          <CreateStudentForm action={createStudent} cancelUrl={cancelUrl} />
        </div>
      </main>
    </div>
  );
}
