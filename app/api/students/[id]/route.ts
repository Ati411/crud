import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { auth } from "@/app/auth";
import { z } from "zod";

const apiStudentSchema = z.object({
  studentCode: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  major: z.string().min(1).optional(), // เพิ่มบรรทัดนี้
  year: z.number().int().min(1).max(8).optional(), // เพิ่มบรรทัดนี้
  status: z.string().optional(),
});

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await verifyAccess(request);
  if (!access)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const studentId = parseInt(resolvedParams.id);

  if (isNaN(studentId))
    return NextResponse.json(
      { error: "Bad Request: Invalid ID" },
      { status: 400 },
    );

  try {
    const targetStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!targetStudent)
      return NextResponse.json({ error: "Not Found" }, { status: 404 });

    const isOwner = targetStudent.userId === access.user.id;
    const isPrivileged =
      ["ADMIN"].includes(access.user.role) || access.isApiTest;
    if (!isOwner && !isPrivileged)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
      data: validation.data,
    });
    return NextResponse.json(
      { success: true, data: updatedStudent },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await verifyAccess(request);
  if (!access)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (access.user.role !== "ADMIN" && !access.isApiTest) {
    return NextResponse.json(
      { error: "Forbidden: เฉพาะ Admin" },
      { status: 403 },
    );
  }

  const resolvedParams = await params;
  const studentId = parseInt(resolvedParams.id);

  if (isNaN(studentId))
    return NextResponse.json(
      { error: "Bad Request: Invalid ID" },
      { status: 400 },
    );

  try {
    await prisma.student.delete({ where: { id: studentId } });
    return NextResponse.json(
      { success: true, message: "ลบข้อมูลสำเร็จ" },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.code === "P2025")
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
