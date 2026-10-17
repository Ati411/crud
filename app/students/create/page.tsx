import prisma from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { studentSchema } from "../validation";
import CreateStudentForm from "./create-student-form";

type FormState = {
  success: boolean;
  errors?: {
    studentCode?: string[];
    name?: string[];
    email?: string[];
    major?: string[];
    year?: string[];
  };
};

async function createStudent(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

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
    await prisma.student.create({
      data: result.data,
    });
  } catch {
    return {
      success: false,
      errors: {
        studentCode: ["รหัสนักศึกษานี้มีอยู่แล้ว"],
      },
    };
  }

  redirect("/students");
}

export default function CreateStudentPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">เพิ่มนักศึกษา</h1>

        <p className="mt-2 text-gray-600">กรอกข้อมูลนักศึกษา</p>
      </div>

      <CreateStudentForm action={createStudent} />
    </main>
  );
}
