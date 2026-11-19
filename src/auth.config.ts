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
      session.user.id = token.id;
      if (token.role) session.user.role = token.role;
      if (token.slug) session.user.slug = token.slug;
      session.user.mustChangePassword = Boolean(token.mustChangePassword);
      if (token.email) session.user.email = token.email;
      if (typeof token.name === "string") session.user.name = token.name;
      return session;
    },
  },
} satisfies NextAuthConfig;
