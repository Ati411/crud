import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/app/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    // ==========================================
    // Login ด้วย GitHub
    // ==========================================
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),

    // ==========================================
    // Login ด้วย Email / Password
    // ==========================================
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        // ดักกรณีไม่พบ User หรือ User นี้สมัครผ่าน GitHub (จึงไม่มีรหัสผ่านในระบบ)
        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // ==========================================
    // JWT
    // ==========================================
    async jwt({ token, user }) {
      if (user) {
        if (typeof user.id === "string") {
          token.id = user.id;
        }

        // เซฟตี้ดักไว้เผื่อกรณีล็อกอิน GitHub ครั้งแรกแล้ว Prisma ยังไม่ทันรีเทิร์น Role กลับมา
        const userRole = (user as any).role || "USER";

        switch (userRole) {
          case "ADMIN":
            token.role = "ADMIN";
            break;
          default:
            token.role = "USER";
        }
      }

      return token;
    },

    // ==========================================
    // Session
    // ==========================================
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // เช็กแค่ ADMIN หรือ USER
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "USER";
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
