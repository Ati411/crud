import Link from "next/link";
import DeleteButton from "@/app/students/delete-button";
import StatusDropdown from "./status-dropdown";

export default function RecentStudentsTable({
  recentStudents,
  isAdmin,
}: {
  recentStudents: any[];
  isAdmin: boolean;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <h3 className="text-base font-semibold text-slate-900">
          นักศึกษาที่เพิ่มล่าสุด (10 อันดับ)
        </h3>
        <Link
          href="/students/create"
          className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
        >
          + เพิ่มข้อมูล
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                รหัส
              </th>
              <th className="border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                ชื่อ-นามสกุล
              </th>
              <th className="border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                สถานะ
              </th>
              <th className="border-b border-slate-200 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {recentStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  ยังไม่มีข้อมูลนักศึกษา
                </td>
              </tr>
            ) : (
              recentStudents.map((student) => (
                <tr
                  key={student.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {student.studentCode}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{student.name}</td>
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/students/edit/${student.id}`}
                        className="inline-flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-50"
                      >
                        แก้ไข
                      </Link>
                      <DeleteButton id={student.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {recentStudents.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-center">
          <Link
            href="/students"
            className="text-xs font-medium uppercase tracking-wider text-indigo-600 hover:text-indigo-800"
          >
            ดูรายชื่อนักศึกษาทั้งหมด &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
