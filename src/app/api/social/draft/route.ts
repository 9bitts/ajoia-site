import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAudit } from "@/lib/audit";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { remodelPost } from "@/lib/social/ai";
import { loadSocialArticle } from "@/lib/social/article";
import { publicError } from "@/lib/social/errors";
import { requireAdmin } from "@/lib/social/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  articleId: z.string().min(1).max(80),
  network: z.enum(["FACEBOOK", "INSTAGRAM", "X"]),
});

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  if (await isRateLimited(`social-ai:${gate.session.user.id}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitos ajustes em pouco tempo. Tente de novo mais tarde." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const article = await loadSocialArticle(parsed.data.articleId);
  if (!article) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  if (article.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "Publique a matéria no site antes de ajustar o texto." },
      { status: 400 }
    );
  }

  try {
    const text = await remodelPost(parsed.data.network, article);
    await recordAudit({
      action: "social.draft",
      actorId: gate.session.user.id,
      actorEmail: gate.session.user.email,
      targetType: "article",
      targetId: article.id,
      detail: parsed.data.network,
      ip: clientIp(req),
    });
    return NextResponse.json({
      text,
      note: "Texto ajustado. Leia antes de publicar. A IA não acrescenta fato que não esteja na matéria.",
    });
  } catch (error) {
    const message = publicError(error, "A IA não respondeu.");
    const status = message.includes("não está configurada") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
