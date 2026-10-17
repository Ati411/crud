import CreateStudentForm from "./create-student-form";
import { createStudent } from "../actions";

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
