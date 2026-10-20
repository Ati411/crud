import { auth, signOut } from "@/app/auth";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import StatCard from "@/app/components/ui/StatCard";
import RecentStudentsTable from "./recent-students-table";

export default async function AdminDashboardPage() {
  const session = await auth();
  await new Promise((resolve) => setTimeout(resolve, 1500)); // เพิ่มดีเลย์ 1.5 วินาทีเพื่อให้เห็น Skeleton Loading

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/unauthorized");

  const [
    totalStudents,
    activeStudents,
    totalUsers,
    majorBreakdown,
    recentStudents,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { status: "ACTIVE" } }), // ต้องแก้เป็น "ACTIVE" ตาม Enum ใหม่
    prisma.user.count(),
    prisma.student.groupBy({
      by: ["major"],
      _count: { major: true },
      orderBy: { _count: { major: "desc" } },
      take: 5,
    }),
    prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-7xl">
        {/* ================= HEADER ================= */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              ศูนย์บัญชาการระบบ — ผู้ดูแล:{" "}
              <span className="font-semibold text-indigo-600">
                {session.user.name || session.user.email}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/students"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              ดูข้อมูลนักศึกษาทั้งหมด
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button type="submit" variant="danger">
                ออกจากระบบ
              </Button>
            </form>
          </div>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="นักศึกษาทั้งหมด"
            value={totalStudents}
            unit="คน"
            colorTheme="indigo"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="สถานะกำลังศึกษา"
            value={activeStudents}
            unit="คน"
            colorTheme="emerald"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="บัญชีผู้ใช้ระบบ (Users)"
            value={totalUsers}
            unit="บัญชี"
            colorTheme="blue"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            }
          />
        </div>

        {/* ================= CHARTS / TABLE ================= */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-1 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-base font-semibold text-slate-900">
                สาขาวิชายอดนิยม
              </h3>
            </div>
            <div className="p-6">
              {majorBreakdown.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">
                  ยังไม่มีข้อมูล
                </p>
              ) : (
                <ul className="space-y-4">
                  {majorBreakdown.map((item, index) => (
                    <li
                      key={item.major}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {item.major}
                        </span>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                        {item._count.major}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <RecentStudentsTable recentStudents={recentStudents} isAdmin={true} />
        </div>
      </main>
    </div>
  );
}
