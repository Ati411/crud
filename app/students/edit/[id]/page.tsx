import prisma from "@/app/lib/prisma";
import { updateStudent } from "../../actions";
import EditStudentForm from "./edit-student-form"; // อิมพอร์ตฟอร์ม Client Component ที่เราแยกไว้
import { notFound } from "next/navigation";
import { auth } from "@/app/auth"; // <--- นำเข้า auth

// อัปเดต Type ให้รองรับ Promise ตามมาตรฐาน Next.js 15
export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth(); // <--- เช็ก Session
  const cancelUrl = session?.user?.role === "ADMIN" ? "/admin" : "/students"; // <--- กำหนด URL

  const { id } = await params;
  const studentId = parseInt(id);

  if (isNaN(studentId)) notFound();

  // ดึงข้อมูลเดิมของนักศึกษา
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            ไม่พบข้อมูลนักศึกษา
          </h1>
          <p className="mt-2 text-slate-500">
            ข้อมูลนี้อาจถูกลบไปแล้ว หรือ URL ไม่ถูกต้อง
          </p>
        </div>
      </div>
    );
  }

  // ผูก ID ของนักศึกษาเข้ากับ Server Action เพื่อให้รู้ว่ากำลังแก้ข้อมูลใคร
  const updateAction = updateStudent.bind(null, student.id);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            แก้ไขข้อมูลนักศึกษา
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            ปรับปรุงข้อมูลประวัติของนักศึกษา:{" "}
            <span className="font-medium text-indigo-600">
              {student.studentCode}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* โยน cancelUrl ลงไปในฟอร์ม */}
          <EditStudentForm
            action={updateAction}
            student={student}
            cancelUrl={cancelUrl}
          />
        </div>
      </main>
    </div>
  );
}
