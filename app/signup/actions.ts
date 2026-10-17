"use server";

import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";

// 1. สร้าง Schema สำหรับตรวจสอบข้อมูลด้วย Zod แบบรัดกุม
const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "ชื่อ-นามสกุล ต้องมีอย่างน้อย 2 ตัวอักษร")
      .max(100, "ชื่อ-นามสกุล ต้องไม่เกิน 100 ตัวอักษร"),
    email: z
      .string()
      .trim()
      .toLowerCase() // บังคับเป็นตัวพิมพ์เล็กทั้งหมดป้องกันอีเมลซ้ำซ้อน
      .email("รูปแบบอีเมลไม่ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"], // ชี้เป้าให้ Error ไปแสดงที่ช่อง confirmPassword
  });

export type SignupFormState = {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

export async function signupAction(
  prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  // 2. ดึงข้อมูลและ Validate
  const validatedFields = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // 3. เช็กก่อนว่าอีเมลนี้ถูกใช้ไปหรือยัง
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        errors: {
          email: ["อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น"],
        },
      };
    }

    // 4. เข้ารหัสรหัสผ่านด้วย bcrypt (Salt rounds = 10 คือมาตรฐานที่สมดุลระหว่างความเร็วและความปลอดภัย)
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. บันทึกลงฐานข้อมูล โดยบังคับ Role เป็น USER เสมอ
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
      },
    });
  } catch {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในระบบฐานข้อมูล ไม่สามารถสมัครสมาชิกได้ในขณะนี้",
    };
  }

  // 6. ถ้าสำเร็จ ให้เด้งไปหน้า Login พร้อมแนบ Query Parameter เพื่อแจ้งเตือนได้
  redirect("/login?registered=true");
}
