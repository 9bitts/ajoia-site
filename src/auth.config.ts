import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (!token.id || token.invalid) return null as unknown as typeof session;
      session.user.mustChangePassword = Boolean(token.mustChangePassword);
      return session;
    },
  },
} satisfies NextAuthConfig;
