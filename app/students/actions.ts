"use server";

import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { studentSchema } from "./validation";
import { auth } from "@/app/auth";

export type FormState = {
  success: boolean;
  message?: string;
  errors?: {
    studentCode?: string[];
    name?: string[];
    email?: string[];
    major?: string[];
    year?: string[];
  };
};

// ============================================================================
// 1. CREATE STUDENT (สร้างโปรไฟล์นักศึกษา)
// ============================================================================
export async function createStudent(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  // ด่านที่ 1: ตรวจสอบการยืนยันตัวตน (Authentication)
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized: กรุณาเข้าสู่ระบบก่อนทำรายการ",
    };
  }

  // ด่านที่ 2: ตรวจสอบสิทธิ์และการผูก ID (Authorization)
  let assignedUserId: string | null = null;

  if (session.user.role === "USER") {
    const existingProfile = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return {
        success: false,
        message:
          "Forbidden: บัญชีของคุณได้ลงทะเบียนข้อมูลนักศึกษาไปแล้ว ไม่สามารถสร้างซ้ำได้",
      };
    }
    // ถ้าเป็น USER ธรรมดา บังคับให้ผูก ID กับบัญชีที่กำลังล็อกอิน
    assignedUserId = session.user.id;
  }
  // หมายเหตุ: ถ้าเป็น ADMIN จะปล่อยให้ assignedUserId เป็น null ไปเลย สร้างได้ไม่จำกัด

  // ด่านที่ 3: Validate ข้อมูลจากฟอร์ม
  const result = studentSchema.safeParse({
    studentCode: formData.get("studentCode"),
    name: formData.get("name"),
    email: formData.get("email"),
    major: formData.get("major"),
    year: Number(formData.get("year")),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  // ด่านที่ 4: บันทึกลง Database พร้อมดักจับ Unique Constraint Error
  try {
    await prisma.student.create({
      data: {
        ...result.data,
        email: result.data.email || null, // แปลงค่าว่าง "" ให้เป็น null ใน DB
        userId: assignedUserId, // ใช้ตัวแปรที่เราดักเงื่อนไขไว้ด้านบนแทน
      },
    });
  } catch (error: any) {
    // P2002 คือรหัส Error ของ Prisma เมื่อข้อมูลชนกับฟิลด์ที่เป็น @unique
    if (error.code === "P2002") {
      const target = error.meta?.target as string[];
      if (target?.includes("studentCode")) {
        return {
          success: false,
          errors: { studentCode: ["รหัสนักศึกษานี้มีในระบบแล้ว"] },
        };
      }
      if (target?.includes("userId")) {
        return {
          success: false,
          message: "บัญชีผู้ใช้นี้ถูกผูกกับข้อมูลนักศึกษาอื่นไปแล้ว",
        };
      }
    }

    return {
      success: false,
      message: "เกิดข้อผิดพลาดจากระบบฐานข้อมูล ไม่สามารถบันทึกได้",
    };
  }
  // สำเร็จ: กำหนด URL ปลายทางตาม Role
  const redirectUrl = session.user.role === "ADMIN" ? "/admin" : "/students";
  // สำเร็จ: ล้างแคชหน้าแสดงผลและพาไปหน้ารวม
  revalidatePath("/students");
  revalidatePath("/admin"); // ล้างแคชหน้าแอดมินให้ข้อมูลอัปเดตทันที

  redirect(redirectUrl);
}

// ============================================================================
// 2. UPDATE STUDENT (แก้ไขข้อมูลนักศึกษา - เช็กความเป็นเจ้าของหรือสิทธิ์ Admin)
// ============================================================================
export async function updateStudent(
  studentId: number,
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized: กรุณาเข้าสู่ระบบ" };
  }

  // ดึงข้อมูลเดิมมาเช็กก่อนว่ามีตัวตนไหม และใครเป็นเจ้าของ
  const targetStudent = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!targetStudent) {
    return { success: false, message: "ไม่พบข้อมูลนักศึกษาที่ต้องการแก้ไข" };
  }

  // Logic ตรวจสอบสิทธิ์ระดับลึก:
  // ยอมให้แก้ได้เฉพาะ ADMINหรือ "เจ้าของข้อมูลตัวเองเท่านั้น"
  const isOwner = targetStudent.userId === session.user.id;
  const isPrivileged = session.user.role === "ADMIN";

  if (!isOwner && !isPrivileged) {
    return {
      success: false,
      message: "Forbidden: คุณไม่มีสิทธิ์แก้ไขข้อมูลของนักศึกษาคนอื่น",
    };
  }

  const result = studentSchema.safeParse({
    studentCode: formData.get("studentCode"),
    name: formData.get("name"),
    email: formData.get("email"),
    major: formData.get("major"),
    year: Number(formData.get("year")),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.student.update({
      where: { id: studentId },
      data: {
        ...result.data,
        email: result.data.email || null,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        success: false,
        errors: { studentCode: ["รหัสนักศึกษานี้ซ้ำกับคนอื่นในระบบ"] },
      };
    }
    return { success: false, message: "ไม่สามารถอัปเดตข้อมูลได้" };
  }
  // สำเร็จ: กำหนด URL ปลายทางตาม Role
  const redirectUrl = session.user.role === "ADMIN" ? "/admin" : "/students";

  revalidatePath("/students");
  revalidatePath(`/students/edit/${studentId}`);
  revalidatePath("/admin"); // ล้างแคชหน้าแอดมิน

  redirect(redirectUrl);
}

// ============================================================================
// 3. DELETE STUDENT (ลบข้อมูล - จำกัดสิทธิ์เฉพาะ ADMIN เท่านั้น)
// ============================================================================
export async function deleteStudent(id: number) {
  const session = await auth();

  // 1. เช็กว่าล็อกอินหรือยัง
  if (!session?.user?.id) {
    throw new Error("Unauthorized: กรุณาเข้าสู่ระบบ");
  }

  // 2. เช็ก Role แบบเข้มงวด (USER ลบไม่ได้เด็ดขาด)
  if (session.user.role !== "ADMIN") {
    throw new Error(
      "Forbidden: เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่มีสิทธิ์ลบข้อมูล",
    );
  }

  try {
    await prisma.student.delete({
      where: { id },
    });
    revalidatePath("/students");
  } catch (error) {
    throw new Error("ไม่สามารถลบข้อมูลได้ อาจไม่มีข้อมูลนี้อยู่ในระบบแล้ว");
  }
}

// ============================================================================
// 4. UPDATE STUDENT STATUS (เปลี่ยนสถานะจาก Dropdown - เฉพาะ Admin)
// ============================================================================
export async function updateStudentStatus(id: number, newStatus: string) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Forbidden: เฉพาะ Admin เท่านั้นที่เปลี่ยนสถานะได้");
  }

  // ป้องกันการยัดค่าแปลกๆ ที่ไม่มีใน Enum
  const validStatuses = ["ACTIVE", "GRADUATED", "DROPPED", "SUSPENDED"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Invalid Status");
  }

  try {
    await prisma.student.update({
      where: { id },
      data: { status: newStatus as any },
    });

    revalidatePath("/students");
    revalidatePath("/admin");
  } catch (error) {
    throw new Error("ไม่สามารถอัปเดตสถานะได้");
  }
}
