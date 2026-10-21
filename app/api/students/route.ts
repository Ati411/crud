import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { auth } from "@/app/auth";
import { z } from "zod";

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

// ฟังก์ชันตรวจสิทธิ์ (รองรับทั้ง Session จากเว็บ และ API Key จาก Postman)
async function verifyAccess(request: Request) {
  const session = await auth();
  const authHeader = request.headers.get("authorization");
  const isApiTest = authHeader === `Bearer ${process.env.EXTERNAL_API_KEY}`;

  if (!session?.user && !isApiTest) return null;
  return {
    user: session?.user || { role: "ADMIN", id: "API_TESTER" },
    isApiTest,
  };
}

export async function GET(request: Request) {
  const access = await verifyAccess(request);
  if (!access)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const whereCondition = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { studentCode: { contains: search } },
        ],
      }
    : {};

  try {
    const students = await prisma.student.findMany({
      where: whereCondition,
      orderBy: { id: "asc" },
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

export async function POST(request: Request) {
  const access = await verifyAccess(request);
  if (!access)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let assignedUserId = null;
  if (access.user.role === "USER" && !access.isApiTest) {
    const existing = await prisma.student.findUnique({
      where: { userId: access.user.id },
    });
    if (existing)
      return NextResponse.json(
        { error: "Forbidden: มีข้อมูลแล้ว" },
        { status: 403 },
      );
    assignedUserId = access.user.id;
  }

  try {
    const body = await request.json();
    const validation = apiStudentSchema.safeParse(body);
    if (!validation.success)
      return NextResponse.json(
        { error: "Invalid Data", details: validation.error.flatten() },
        { status: 400 },
      );

    const newStudent = await prisma.student.create({
      data: {
        ...validation.data,
        email: validation.data.email || null,
        userId: assignedUserId,
      },
    });
    return NextResponse.json(
      { success: true, data: newStudent },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === "P2002")
      return NextResponse.json(
        { error: "Conflict: ข้อมูลซ้ำ" },
        { status: 409 },
      );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
