import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { accountId } from "@/lib/account-id";
import { prisma } from "@/lib/db";
import { passwordError } from "@/lib/password";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";

const schema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(10).max(200),
});

export async function POST(req: Request) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const session = await auth();
  const id = accountId(session);
  if (!session?.user || !id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const policy = passwordError(parsed.data.newPassword);
  if (policy) return NextResponse.json({ error: policy }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !user.active) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(parsed.data.newPassword, 10),
      mustChangePassword: false,
      credentialVersion: { increment: 1 },
    },
  });

  await recordAudit({
    action: "user.password_change",
    actorId: user.id,
    actorEmail: user.email,
    targetType: "user",
    targetId: user.id,
    ip: clientIp(req),
  });

  return NextResponse.json({ ok: true });
}
