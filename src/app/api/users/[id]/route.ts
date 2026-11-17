import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { sendPortalMail } from "@/lib/mail";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  approved: z.boolean(),
});

export async function PATCH(req: Request, { params }: Params) {
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

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const approved = parsed.data.approved;
  const user = await prisma.user.update({
    where: { id },
    data: {
      approved,
      active: approved,
      credentialVersion: approved ? existing.credentialVersion : { increment: 1 },
    },
    select: {
      id: true,
      name: true,
      email: true,
      approved: true,
      active: true,
    },
  });

  await recordAudit({
    action: approved ? "user.approve" : "user.suspend",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "user",
    targetId: user.id,
    detail: user.email,
    ip: clientIp(req),
  });

  if (approved) {
    void sendPortalMail({
      to: user.email,
      subject: "Acesso liberado — Ajoia Brasil",
      text: [
        `Olá, ${user.name}.`,
        "",
        "Sua conta da redação foi liberada. Entre em /admin/login com o e-mail e a senha do cadastro.",
      ].join("\n"),
    });
    void sendPortalMail({
      subject: `[Conta] ${user.name} liberado`,
      text: `${session.user.email} liberou ${user.email}.`,
    });
  }

  return NextResponse.json({ user });
}
