import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";
import { requireStoreStaff } from "@/lib/store-access";
import { parseCategory } from "@/lib/store-input";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const { session, error } = await requireStoreStaff();
  if (error || !session) return error;

  const { id } = await params;
  const existing = await prisma.storeCategory.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = parseCategory(json);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const category = await prisma.storeCategory.update({
    where: { id },
    data: { name: parsed.name, description: parsed.description },
  });

  await recordAudit({
    action: "store.category.update",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "storeCategory",
    targetId: category.id,
    detail: category.name,
    ip: clientIp(req),
  });

  return NextResponse.json({ category });
}

export async function DELETE(req: Request, { params }: Params) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const { session, error } = await requireStoreStaff();
  if (error || !session) return error;

  const { id } = await params;
  const existing = await prisma.storeCategory.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });

  await prisma.storeCategory.delete({ where: { id } });
  await recordAudit({
    action: "store.category.delete",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "storeCategory",
    targetId: id,
    detail: existing.name,
    ip: clientIp(req),
  });

  return NextResponse.json({ ok: true });
}
