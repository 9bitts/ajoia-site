import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";
import { requireStoreStaff } from "@/lib/store-access";
import { parseCategory } from "@/lib/store-input";
import { uniqueCategorySlug } from "@/lib/store";

export async function GET() {
  const { error } = await requireStoreStaff();
  if (error) return error;
  const categories = await prisma.storeCategory.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const { session, error } = await requireStoreStaff();
  if (error || !session) return error;

  const json = await req.json().catch(() => null);
  const parsed = parseCategory(json);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const last = await prisma.storeCategory.findFirst({ orderBy: { position: "desc" } });
  const category = await prisma.storeCategory.create({
    data: {
      name: parsed.name,
      description: parsed.description,
      slug: await uniqueCategorySlug(parsed.name),
      position: (last?.position ?? 0) + 1,
    },
  });

  await recordAudit({
    action: "store.category.create",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "storeCategory",
    targetId: category.id,
    detail: category.name,
    ip: clientIp(req),
  });

  return NextResponse.json({ category }, { status: 201 });
}
