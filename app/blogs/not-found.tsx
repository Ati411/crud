import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "32px", textAlign: "center" }}>
      <h2 style={{ color: "#d93025" }}>404 - ไม่พบบทความนี้ในระบบ</h2>
      <p style={{ color: "#666", marginTop: "8px" }}>
        รหัสบทความที่คุณค้นหาไม่มีอยู่จริง หรืออาจถูกลบออกไปแล้ว
      </p>

      <div style={{ marginTop: "20px" }}>
        <Link
          href="/blogs"
          style={{ color: "#0070f3", textDecoration: "underline" }}
        >
          ← ย้อนกลับไปยังหน้ารายการบทความทั้งหมด
        </Link>
      </div>
    </div>
  );
}
