import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { sendPortalMail } from "@/lib/mail";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";

import { imageUrlError } from "@/lib/image-url";

type Params = { params: Promise<{ id: string }> };

const approvedSchema = z.object({ approved: z.boolean() }).strict();
const profileSchema = z.object({
  bio: z.string().max(2000),
  avatarUrl: z.string().max(300).nullable(),
  roleLabel: z.string().trim().min(2).max(80).optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || (existing.role !== "COLUMNIST" && existing.id !== session.user.id)) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const isSelf = session.user.id === id;
  if (!isAdmin && !isSelf) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const approvedParsed = approvedSchema.safeParse(json);
  if (approvedParsed.success) {
    if (!isAdmin) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    const approved = approvedParsed.data.approved;
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

  const profile = profileSchema.safeParse(json);
  if (!profile.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const avatarError = imageUrlError(profile.data.avatarUrl);
  if (avatarError) {
    return NextResponse.json({ error: avatarError }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id },
    data: {
      bio: profile.data.bio,
      avatarUrl: profile.data.avatarUrl,
      ...(isAdmin && profile.data.roleLabel ? { roleLabel: profile.data.roleLabel } : {}),
    },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      roleLabel: true,
    },
  });
  await recordAudit({
    action: "user.profile",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "user",
    targetId: user.id,
    detail: user.name,
    ip: clientIp(req),
  });
  return NextResponse.json({ user });
}
