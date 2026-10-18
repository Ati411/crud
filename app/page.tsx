import { redirect } from "next/navigation";
import { auth } from "@/app/auth";

export default async function HomePage() {
  const session = await auth();

  // 1. ถ้ายังไม่ล็อกอิน ให้เด้งไปหน้าเข้าสู่ระบบ
  if (!session?.user) {
    redirect("/login");
  }

  // 2. ถ้าล็อกอินแล้วและเป็น ADMIN ให้เด้งไปหน้า Admin Dashboard
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  // 3. ถ้าเป็น USER ธรรมดา ให้เด้งไปหน้าจัดการนักศึกษา
  redirect("/students");
}
