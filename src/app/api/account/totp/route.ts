import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";
import { generateTotpSecret, openSecret, sealSecret, totpUri, verifyTotp } from "@/lib/totp";

const schema = z.object({
  action: z.enum(["start", "confirm", "disable"]),
  code: z.string().max(12).optional(),
  password: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.active) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (parsed.data.action === "start") {
    const secret = generateTotpSecret();
    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: sealSecret(secret), totpEnabled: false },
    });
    return NextResponse.json({
      secret,
      otpauth: totpUri(user.email, secret),
    });
  }

  const secret = user.totpSecret ? openSecret(user.totpSecret) : null;
  if (!secret || !parsed.data.code || !verifyTotp(secret, parsed.data.code)) {
    return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  }

  if (parsed.data.action === "confirm") {
    await prisma.user.update({
      where: { id: user.id },
      data: { totpEnabled: true },
    });
    await recordAudit({
      action: "totp.enable",
      actorId: user.id,
      actorEmail: user.email,
      ip: clientIp(req),
    });
    return NextResponse.json({ ok: true, enabled: true });
  }

  const password = parsed.data.password || "";
  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      totpEnabled: false,
      totpSecret: null,
      credentialVersion: { increment: 1 },
    },
  });
  await recordAudit({
    action: "totp.disable",
    actorId: user.id,
    actorEmail: user.email,
    ip: clientIp(req),
  });
  return NextResponse.json({ ok: true, enabled: false });
}
