import prisma from "@/app/lib/prisma";
import DeleteButton from "./delete-button";
import { auth, signOut } from "@/app/auth";
import Link from "next/link";
import SearchAndFilter from "./search-filter";

// เปลี่ยน Type ของ searchParams ให้เป็น Promise
export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; major?: string }>;
}) {
  const session = await auth();

  // ต้องใช้ await แกะค่า searchParams ออกมาก่อน
  const params = await searchParams;
  const query = params?.query || "";
  const majorFilter = params?.major || "";

  // 1. ดึงข้อมูลสาขาวิชาทั้งหมด
  const distinctMajors = await prisma.student.findMany({
    select: { major: true },
    distinct: ["major"],
  });
  const majorList = distinctMajors.map((m) => m.major);

  // 2. Query ดึงนักศึกษา
  const students = await prisma.student.findMany({
    where: {
      AND: [
        majorFilter ? { major: majorFilter } : {},
        query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { studentCode: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    },
    orderBy: { id: "asc" },
  });

  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";
  const isPrivileged = ["ADMIN", "STAFF"].includes(session?.user?.role || "");

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Student Management
          </h1>
          <p className="mt-2 text-gray-600">
            จำนวนนักศึกษา: <strong>{students.length}</strong> คน
          </p>
        </div>

        {/* Auth Status & Navigation */}
        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
              >
                สมัครสมาชิก
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="font-medium text-gray-900">
                  {session.user.name || session.user.email}
                </p>
                <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                  Role: {session.user.role}
                </span>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/students" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {isLoggedIn && (
        <div className="mb-6">
          <Link
            href="/students/create"
            className="inline-block rounded bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700"
          >
            + เพิ่มข้อมูลนักศึกษา
          </Link>
        </div>
      )}

      {/* Component ค้นหาและกรองข้อมูล */}
      <SearchAndFilter majors={majorList} />

      {/* ตารางข้อมูล */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">รหัสนักศึกษา</th>
              <th className="px-4 py-3 font-semibold">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">สาขา</th>
              <th className="px-4 py-3 font-semibold">ชั้นปี</th>
              <th className="px-4 py-3 font-semibold">สถานะ</th>
              {isLoggedIn && (
                <th className="px-4 py-3 font-semibold">จัดการ</th>
              )}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={isLoggedIn ? 8 : 7}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  ไม่พบข้อมูลนักศึกษาที่ค้นหา
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const canEdit =
                  isPrivileged || student.userId === session?.user?.id;
                return (
                  <tr
                    key={student.id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{student.id}</td>
                    <td className="px-4 py-3">{student.studentCode}</td>
                    <td className="px-4 py-3 font-medium">{student.name}</td>
                    <td className="px-4 py-3">{student.email ?? "-"}</td>
                    <td className="px-4 py-3">{student.major}</td>
                    <td className="px-4 py-3">{student.year}</td>
                    <td className="px-4 py-3">
                      {student.status ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          กำลังศึกษา
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          ไม่ใช้งาน
                        </span>
                      )}
                    </td>
                    {isLoggedIn && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {canEdit && (
                            <Link
                              href={`/students/edit/${student.id}`}
                              className="rounded-md bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-600"
                            >
                              แก้ไข
                            </Link>
                          )}
                          {isAdmin && <DeleteButton id={student.id} />}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
