import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";

import prisma from "@/app/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
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

        if (!user) {
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

    // ==========================================
    // Login ด้วย GitHub
    // ==========================================
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
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

        switch (user.role) {
          case "ADMIN":
            token.role = "ADMIN";
            break;
          case "STAFF":
            token.role = "STAFF";
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

        session.user.role =
          token.role === "ADMIN" ||
          token.role === "STAFF" ||
          token.role === "USER"
            ? token.role
            : "USER";
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },
});
