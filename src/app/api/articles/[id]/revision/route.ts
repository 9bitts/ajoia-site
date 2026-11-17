import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, { params }: Params) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.articleRevision.deleteMany({ where: { articleId: id } });
  await recordAudit({
    action: "article.revision_discard",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "article",
    targetId: id,
    ip: clientIp(req),
  });
  return NextResponse.json({ ok: true });
}
