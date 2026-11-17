import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";
import { temporaryPassword } from "@/lib/tokens";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.role !== "COLUMNIST") {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const password = temporaryPassword();
  await prisma.user.update({
    where: { id },
    data: {
      passwordHash: await bcrypt.hash(password, 10),
      mustChangePassword: true,
      credentialVersion: { increment: 1 },
    },
  });

  await recordAudit({
    action: "user.password_reset",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "user",
    targetId: id,
    detail: existing.email,
    ip: clientIp(req),
  });

  return NextResponse.json({ temporaryPassword: password });
}
