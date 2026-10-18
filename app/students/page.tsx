import prisma from "@/app/lib/prisma";
import DeleteButton from "./delete-button";
import { auth, signOut } from "@/app/auth";
import Link from "next/link";
import SearchAndFilter from "./search-filter";
import Button from "@/app/components/ui/Button";
import StatusDropdown from "@/app/admin/status-dropdown";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; major?: string }>;
}) {
  const session = await auth();

  const params = await searchParams;
  const query = params?.query || "";
  const majorFilter = params?.major || "";

  const distinctMajors = await prisma.student.findMany({
    select: { major: true },
    distinct: ["major"],
  });
  const majorList = distinctMajors.map((m) => m.major);

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
  const isPrivileged = ["ADMIN"].includes(session?.user?.role || "");

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Student Management
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              จำนวนนักศึกษาในระบบ:
              <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                {students.length}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-5 rounded-full border border-slate-200 bg-white px-5 py-2.5 shadow-sm">
                <div className="flex flex-col items-end">
                  <p className="mb-1.5 text-sm font-semibold leading-none text-slate-900">
                    {session.user.name || session.user.email}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-700 ring-1 ring-inset ring-blue-600/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    {session.user.role}
                  </span>
                </div>

                <div className="h-8 w-px bg-slate-200"></div>

                {isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Dashboard
                    </Link>
                    <div className="h-8 w-px bg-slate-200"></div>
                  </>
                )}

                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/students" });
                  }}
                >
                  <Button
                    type="submit"
                    variant="secondary"
                    className="border-none shadow-none text-slate-500 hover:text-red-600 hover:bg-transparent px-2 py-1"
                  >
                    ออกจากระบบ
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full max-w-2xl">
              <SearchAndFilter majors={majorList} />
            </div>

            {isLoggedIn && (
              <Link
                href="/students/create"
                className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                เพิ่มนักศึกษา
              </Link>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    ลำดับ
                  </th>
                  <th className="border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    รหัสนักศึกษา
                  </th>
                  <th className="border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    สาขา
                  </th>
                  <th className="border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    ชั้นปี
                  </th>
                  <th className="border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    สถานะ
                  </th>
                  {isLoggedIn && (
                    <th className="border-b border-slate-200 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                      จัดการ
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isLoggedIn ? 8 : 7}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-medium text-slate-600">
                          ไม่พบข้อมูลนักศึกษา
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => {
                    const canEdit =
                      isPrivileged || student.userId === session?.user?.id;
                    return (
                      <tr
                        key={student.id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-4 font-medium text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {student.studentCode}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {student.email ?? "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {student.major}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          ปี {student.year}
                        </td>
                        <td className="px-6 py-4">
                          {isAdmin ? (
                            <StatusDropdown
                              studentId={student.id}
                              currentStatus={student.status}
                            />
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase ring-1 ring-inset ${
                                student.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                                  : student.status === "GRADUATED"
                                    ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                                    : student.status === "DROPPED"
                                      ? "bg-amber-50 text-amber-700 ring-amber-600/20"
                                      : "bg-red-50 text-red-700 ring-red-600/20"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  student.status === "ACTIVE"
                                    ? "bg-emerald-500"
                                    : student.status === "GRADUATED"
                                      ? "bg-blue-500"
                                      : student.status === "DROPPED"
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                }`}
                              ></span>
                              {student.status === "ACTIVE"
                                ? "กำลังศึกษา"
                                : student.status === "GRADUATED"
                                  ? "จบการศึกษา"
                                  : student.status === "DROPPED"
                                    ? "ดรอปเรียน"
                                    : "พ้นสภาพ"}
                            </span>
                          )}
                        </td>
                        {isLoggedIn && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {canEdit && (
                                <Link
                                  href={`/students/edit/${student.id}`}
                                  className="inline-flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-50"
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
        </div>
      </main>
    </div>
  );
}
