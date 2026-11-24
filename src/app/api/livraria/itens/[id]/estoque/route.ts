import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";
import { requireStoreStaff } from "@/lib/store-access";
import { parseStock } from "@/lib/store-input";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const { session, error } = await requireStoreStaff();
  if (error || !session) return error;

  const { id } = await params;
  const existing = await prisma.storeItem.findUnique({
    where: { id },
    select: { id: true, name: true, stock: true },
  });
  if (!existing) return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = parseStock(json);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (parsed.stock === existing.stock) {
    return NextResponse.json({ error: "O estoque não mudou." }, { status: 400 });
  }

  const item = await prisma.storeItem.update({
    where: { id },
    data: { stock: parsed.stock },
    select: { id: true, stock: true },
  });

  await recordAudit({
    action: "store.stock",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "storeItem",
    targetId: item.id,
    detail: `${existing.stock} → ${item.stock}${parsed.note ? ` · ${parsed.note}` : ""}`,
    ip: clientIp(req),
  });

  return NextResponse.json({ item });
}
