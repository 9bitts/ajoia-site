import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { deleteMediaFile, mediaUsages } from "@/lib/media";
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
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  if (!asset.url.startsWith("/uploads/")) {
    return NextResponse.json(
      { error: "Arquivo fixo do site. Ele permanece na biblioteca." },
      { status: 400 }
    );
  }

  const usages = await mediaUsages(asset.url);
  const inUse = usages.articles.length > 0 || usages.users.length > 0;
  const body = await req.json().catch(() => ({}));
  if (body?.confirm !== true) {
    return NextResponse.json(
      {
        error: inUse ? "Esta imagem ainda está em uso." : "Confirme para apagar.",
        usages,
      },
      { status: inUse ? 409 : 200 }
    );
  }

  await deleteMediaFile(asset.url);
  await prisma.mediaAsset.delete({ where: { id } });
  await recordAudit({
    action: "media.delete",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "media",
    targetId: id,
    detail: asset.url,
    ip: clientIp(req),
  });
  return NextResponse.json({ ok: true });
}
