import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export function isStoreStaff(role: string | undefined) {
  return role === "ADMIN" || role === "LIVREIRO";
}

export async function requireStoreStaff() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }
  if (!isStoreStaff(session.user.role)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Sem permissão" }, { status: 403 }),
    };
  }
  return { session, error: null };
}

export async function requireStorePage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (!isStoreStaff(session.user.role)) redirect("/admin");
  return session;
}
