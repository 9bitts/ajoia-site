import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { openSecret, verifyTotp } from "@/lib/totp";

const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000;
const COLUMNIST_SESSION_MS = 7 * 24 * 60 * 60 * 1000;

class TotpRequired extends CredentialsSignin {
  code = "totp_required";
}

class TotpInvalid extends CredentialsSignin {
  code = "totp_invalid";
}

class RateLimited extends CredentialsSignin {
  code = "rate_limited";
}

declare module "next-auth" {
  interface User {
    role: Role;
    slug: string;
    credentialVersion: number;
    mustChangePassword: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      slug: string;
      mustChangePassword: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    slug: string;
    credentialVersion: number;
    mustChangePassword: boolean;
    sessionEndsAt: number;
    invalid?: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
        code: { label: "Código", type: "text" },
      },
      async authorize(credentials, request) {
        const email = String(credentials?.email || "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password || "");
        const code = String(credentials?.code || "");
        const ip = clientIp(request);
        if (!email || !password) return null;

        if (await isRateLimited(`login-email:${email}`, 8, 15 * 60 * 1000)) {
          throw new RateLimited();
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.active) {
          await recordAudit({
            action: "login.failure",
            actorEmail: email,
            detail: "credencial",
            ip,
          });
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          await recordAudit({
            action: "login.failure",
            actorId: user.id,
            actorEmail: email,
            detail: "credencial",
            ip,
          });
          return null;
        }

        if (user.totpEnabled) {
          if (!code.trim()) throw new TotpRequired();
          const secret = user.totpSecret ? openSecret(user.totpSecret) : null;
          if (!secret || !verifyTotp(secret, code)) {
            await recordAudit({
              action: "login.failure",
              actorId: user.id,
              actorEmail: email,
              detail: "totp",
              ip,
            });
            throw new TotpInvalid();
          }
        }

        await recordAudit({
          action: "login.success",
          actorId: user.id,
          actorEmail: email,
          ip,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          slug: user.slug,
          credentialVersion: user.credentialVersion,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.slug = user.slug;
        token.credentialVersion = user.credentialVersion;
        token.mustChangePassword = user.mustChangePassword;
        token.invalid = false;
        const ttl = user.role === "ADMIN" ? ADMIN_SESSION_MS : COLUMNIST_SESSION_MS;
        token.sessionEndsAt = Date.now() + ttl;
        return token;
      }

      if (!token.id || token.invalid) {
        token.invalid = true;
        return token;
      }

      if (typeof token.sessionEndsAt === "number" && Date.now() > token.sessionEndsAt) {
        token.invalid = true;
        return token;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: {
          id: true,
          role: true,
          slug: true,
          active: true,
          credentialVersion: true,
          mustChangePassword: true,
          email: true,
          name: true,
        },
      });

      if (
        !dbUser ||
        !dbUser.active ||
        dbUser.credentialVersion !== token.credentialVersion
      ) {
        token.invalid = true;
        return token;
      }

      token.role = dbUser.role;
      token.slug = dbUser.slug;
      token.mustChangePassword = dbUser.mustChangePassword;
      token.email = dbUser.email;
      token.name = dbUser.name;
      return token;
    },
    async session({ session, token }) {
      if (!token.id || token.invalid) return null as unknown as typeof session;
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.slug = token.slug;
      session.user.mustChangePassword = Boolean(token.mustChangePassword);
      if (token.email) session.user.email = token.email;
      if (token.name) session.user.name = token.name;
      return session;
    },
  },
});
