import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { studentSchema } from "@/app/students/validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;

  const studentId = Number(id);

  if (!Number.isInteger(studentId)) {
    return NextResponse.json(
      {
        message: "Student ID ไม่ถูกต้อง",
      },
      {
        status: 400,
      },
    );
  }

  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
  });

  if (!student) {
    return NextResponse.json(
      {
        message: "ไม่พบข้อมูลนักศึกษา",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json(student);
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const studentId = Number(id);

    if (!Number.isInteger(studentId)) {
      return NextResponse.json(
        {
          message: "Student ID ไม่ถูกต้อง",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const result = studentSchema.safeParse({
      studentCode: body.studentCode,
      name: body.name,
      email: body.email ?? "",
      major: body.major,
      year: Number(body.year),
    });

    if (!result.success) {
      return NextResponse.json(
        {
          message: "ข้อมูลไม่ถูกต้อง",
          errors: result.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const student = await prisma.student.update({
      where: {
        id: studentId,
      },
      data: result.data,
    });

    return NextResponse.json(student);
  } catch {
    return NextResponse.json(
      {
        message: "ไม่สามารถแก้ไขข้อมูลนักศึกษาได้",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const studentId = Number(id);

    if (!Number.isInteger(studentId)) {
      return NextResponse.json(
        {
          message: "Student ID ไม่ถูกต้อง",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.student.delete({
      where: {
        id: studentId,
      },
    });

    return NextResponse.json({
      message: "ลบนักศึกษาเรียบร้อยแล้ว",
    });
  } catch {
    return NextResponse.json(
      {
        message: "ไม่พบข้อมูลนักศึกษาหรือไม่สามารถลบได้",
      },
      {
        status: 404,
      },
    );
  }
}
