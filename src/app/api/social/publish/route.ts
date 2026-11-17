import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { loadSocialArticle } from "@/lib/social/article";
import { publicError } from "@/lib/social/errors";
import { requireAdmin } from "@/lib/social/guard";
import { publishToNetwork } from "@/lib/social/publish";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  articleId: z.string().min(1).max(80),
  network: z.enum(["FACEBOOK", "INSTAGRAM", "X"]),
  text: z.string().max(5000),
  confirm: z.boolean().optional(),
});

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  if (await isRateLimited(`social-publish:${gate.session.user.id}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitas publicações em pouco tempo. Tente de novo mais tarde." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const article = await loadSocialArticle(parsed.data.articleId);
  if (!article) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  if (article.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "Publique a matéria no site antes de enviar às redes." },
      { status: 400 }
    );
  }

  const previous = await prisma.socialPublication.findFirst({
    where: { articleId: article.id, network: parsed.data.network, ok: true },
    orderBy: { createdAt: "desc" },
  });
  if (previous && !parsed.data.confirm) {
    return NextResponse.json(
      { needsConfirm: true, previousUrl: previous.externalUrl },
      { status: 409 }
    );
  }

  try {
    const posted = await publishToNetwork({
      network: parsed.data.network,
      text: parsed.data.text,
      url: article.url,
      imageUrl: article.imageUrl,
    });
    await prisma.socialPublication.create({
      data: {
        articleId: article.id,
        network: parsed.data.network,
        text: posted.text,
        externalId: posted.id,
        externalUrl: posted.url,
        ok: true,
      },
    });
    await recordAudit({
      action: "social.publish",
      actorId: gate.session.user.id,
      actorEmail: gate.session.user.email,
      targetType: "article",
      targetId: article.id,
      detail: `${parsed.data.network} ${posted.url || posted.id}`.slice(0, 200),
      ip: clientIp(req),
    });
    return NextResponse.json({ url: posted.url, id: posted.id, text: posted.text });
  } catch (error) {
    const message = publicError(error, "Não foi possível publicar.");
    await prisma.socialPublication
      .create({
        data: {
          articleId: article.id,
          network: parsed.data.network,
          text: parsed.data.text.slice(0, 5000),
          ok: false,
          error: message,
        },
      })
      .catch(() => undefined);
    await recordAudit({
      action: "social.publish",
      actorId: gate.session.user.id,
      actorEmail: gate.session.user.email,
      targetType: "article",
      targetId: article.id,
      detail: `${parsed.data.network} falhou`.slice(0, 200),
      ip: clientIp(req),
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
