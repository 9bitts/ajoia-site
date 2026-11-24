import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";
import { requireStoreStaff } from "@/lib/store-access";
import { parseStoreItem } from "@/lib/store-input";
import { itemInclude, uniqueItemSlug } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

function uniqueMessage(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return null;
  }
  const target = String(error.meta?.target || "");
  if (target.includes("isbn")) return "Este ISBN já está cadastrado.";
  return "Já existe um item com este endereço.";
}

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireStoreStaff();
  if (error) return error;
  const { id } = await params;
  const item = await prisma.storeItem.findUnique({ where: { id }, include: itemInclude });
  if (!item) return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: Request, { params }: Params) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const { session, error } = await requireStoreStaff();
  if (error || !session) return error;

  const { id } = await params;
  const existing = await prisma.storeItem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = parseStoreItem(json, "update");
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const data = parsed.data;

  if (data.categoryId) {
    const category = await prisma.storeCategory.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!category) return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
  }

  const slug = await uniqueItemSlug(data.slug || existing.slug, existing.id);

  try {
    const item = await prisma.storeItem.update({
      where: { id },
      data: {
        kind: data.kind,
        slug,
        name: data.name,
        synopsis: data.synopsis,
        description: data.description,
        priceCents: data.priceCents,
        coverUrl: data.coverUrl,
        coverAlt: data.coverAlt || data.name,
        status: data.status,
        featured: data.featured,
        weightGrams: data.weightGrams,
        widthCm: data.widthCm,
        heightCm: data.heightCm,
        depthCm: data.depthCm,
        isbn13: data.isbn13,
        authors: data.authors,
        publisher: data.publisher,
        edition: data.edition,
        year: data.year,
        pages: data.pages,
        language: data.language,
        binding: data.binding,
        categoryId: data.categoryId,
      },
      include: itemInclude,
    });

    await recordAudit({
      action: "store.item.update",
      actorId: session.user.id,
      actorEmail: session.user.email,
      targetType: "storeItem",
      targetId: item.id,
      detail: item.name,
      ip: clientIp(req),
    });

    return NextResponse.json({ item });
  } catch (err) {
    const message = uniqueMessage(err);
    if (message) return NextResponse.json({ error: message }, { status: 409 });
    throw err;
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const { session, error } = await requireStoreStaff();
  if (error || !session) return error;

  const { id } = await params;
  const existing = await prisma.storeItem.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!existing) return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });

  await prisma.storeItem.delete({ where: { id } });
  await recordAudit({
    action: "store.item.delete",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "storeItem",
    targetId: id,
    detail: existing.name,
    ip: clientIp(req),
  });

  return NextResponse.json({ ok: true });
}
