import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rejectCrossOrigin } from "@/lib/same-origin";

export async function adminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function requireAdmin(req: Request) {
  const origin = rejectCrossOrigin(req);
  if (origin) return { ok: false as const, response: origin };
  const session = await adminSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Sem permissão" }, { status: 401 }),
    };
  }
  return { ok: true as const, session };
}
