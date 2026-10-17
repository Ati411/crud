import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { auth } from "@/app/auth";
import { z } from "zod";

// นำ Schema มาใช้ซ้ำจากไฟล์ validation หรือจะเขียนใหม่เพื่อรองรับ API โดยเฉพาะก็ได้
// ในที่นี้เขียนใหม่เพื่อให้เห็นโครงสร้างการ Validate ข้อมูลดิบ (JSON)
const apiStudentSchema = z.object({
  studentCode: z.string().min(1, "กรุณากรอกรหัสนักศึกษา"),
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  email: z
    .string()
    .email("รูปแบบ Email ไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
  major: z.string().min(1, "กรุณากรอกสาขา"),
  year: z.number().int().min(1).max(8),
});

// ==========================================================
// 1. GET: ดึงข้อมูลนักศึกษาทั้งหมด (รองรับ Search & Filter)
// Endpoint: GET /api/students หรือ /api/students?major=IT&query=somchai
// ==========================================================
export async function GET(request: Request) {
  // ด่าน 1: ตรวจสอบสิทธิ์ (ต้องล็อกอินถึงจะดูข้อมูลได้)
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized: กรุณาเข้าสู่ระบบ" },
      { status: 401 },
    );
  }

  // ดึงพารามิเตอร์จาก URL
  const { searchParams } = new URL(request.url);
  const major = searchParams.get("major");
  const query = searchParams.get("query");

  try {
    const students = await prisma.student.findMany({
      where: {
        AND: [
          major ? { major } : {},
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
      // เพื่อความปลอดภัย ไม่ควรส่ง userId กลับไปให้ API Client
      select: {
        id: true,
        studentCode: true,
        name: true,
        email: true,
        major: true,
        year: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { success: true, data: students },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ==========================================================
// 2. POST: สร้างข้อมูลนักศึกษาใหม่
// Endpoint: POST /api/students
// ==========================================================
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // กำหนดตัวแปรสำหรับผูก ID
  let assignedUserId = null;

  // ถ้าเป็น USER ธรรมดา บังคับว่าต้องสร้างโปรไฟล์ให้ตัวเองเท่านั้น (ผูก ID)
  if (session.user.role === "USER") {
    const existing = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Forbidden: บัญชีนี้มีข้อมูลนักศึกษาแล้ว" },
        { status: 403 },
      );
    }
    assignedUserId = session.user.id;
  }
  // ถ้าเป็น ADMIN จะปล่อยให้ assignedUserId เป็น null ไปเลย เพื่อสร้างเรคคอร์ดลอยๆ ไว้ก่อน

  try {
    const body = await request.json();
    const validation = apiStudentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid Data", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const newStudent = await prisma.student.create({
      data: {
        ...validation.data,
        email: validation.data.email || null,
        userId: assignedUserId, // <--- ใช้ตัวแปรที่เราแยกเงื่อนไขไว้
      },
    });

    return NextResponse.json(
      { success: true, data: newStudent },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Conflict: รหัสนักศึกษานี้มีในระบบแล้ว" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ==========================================================
// 3. PUT: อัปเดตข้อมูลนักศึกษา (ใช้ Request.url แยก ID ไม่ต้องสร้างโฟลเดอร์ [id])
// Endpoint: PUT /api/students?id=5
// ==========================================================
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const studentId = parseInt(idParam || "");

  if (isNaN(studentId)) {
    return NextResponse.json(
      { error: "Bad Request: ระบุ ID ไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  try {
    const targetStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!targetStudent) {
      return NextResponse.json(
        { error: "Not Found: ไม่พบข้อมูลนักศึกษา" },
        { status: 404 },
      );
    }

    // เช็กสิทธิ์ (Ownership or Admin)
    const isOwner = targetStudent.userId === session.user.id;
    const isPrivileged = ["ADMIN", "STAFF"].includes(session.user.role);
    if (!isOwner && !isPrivileged) {
      return NextResponse.json(
        { error: "Forbidden: ไม่มีสิทธิ์แก้ไขข้อมูลผู้อื่น" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validation = apiStudentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid Data", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...validation.data,
        email: validation.data.email || null,
      },
    });

    return NextResponse.json(
      { success: true, data: updatedStudent },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Conflict: รหัสนักศึกษาซ้ำกับผู้อื่น" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ==========================================================
// 4. DELETE: ลบข้อมูล (เฉพาะ Admin)
// Endpoint: DELETE /api/students?id=5
// ==========================================================
export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // กฎเหล็ก: เฉพาะ ADMIN เท่านั้นที่มีสิทธิ์ลบ
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: เฉพาะ Admin เท่านั้นที่ลบข้อมูลได้" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const studentId = parseInt(idParam || "");

  if (isNaN(studentId)) {
    return NextResponse.json(
      { error: "Bad Request: ระบุ ID ไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  try {
    await prisma.student.delete({
      where: { id: studentId },
    });
    return NextResponse.json(
      { success: true, message: "ลบข้อมูลสำเร็จ" },
      { status: 200 },
    );
  } catch (error: any) {
    // P2025 คือหาเรคคอร์ดไม่เจอ
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Not Found: ไม่พบข้อมูลที่ต้องการลบ" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
