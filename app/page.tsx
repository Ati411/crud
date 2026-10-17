import { redirect } from "next/navigation";
import { auth } from "@/app/auth"; // เช็ก path ของ auth.ts ให้ตรงกับโปรเจกต์คุณ

export default async function HomePage() {
  const session = await auth();

  // ถ้ายังไม่ล็อกอิน ให้เด้งไปหน้าเข้าสู่ระบบ
  if (!session?.user) {
    redirect("/login");
  }

  // ถ้าล็อกอินแล้ว ให้เด้งไปหน้าระบบจัดการนักศึกษาเลย
  redirect("/students");
}
