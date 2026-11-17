import { NextResponse } from "next/server";
import { aiConfig } from "@/lib/social/config";
import { TEXT_LIMIT, composePost } from "@/lib/social/copy";
import { requireAdmin } from "@/lib/social/guard";
import { publicConnections } from "@/lib/social/accounts";
import { articleImageUrl, lastPublications, loadSocialArticle } from "@/lib/social/article";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const article = await loadSocialArticle(id);
  if (!article) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  if (article.status !== "PUBLISHED") {
    return NextResponse.json({ published: false });
  }

  const [connections, last] = await Promise.all([
    publicConnections(),
    lastPublications(article.id),
  ]);
  const source = {
    title: article.title,
    dek: article.dek,
    body: article.body,
    sectionLabel: article.sectionLabel,
    opinion: article.opinion,
    url: article.url,
  };

  return NextResponse.json({
    published: true,
    url: article.url,
    ai: Boolean(aiConfig()),
    image: !article.imageUrl ? "missing" : articleImageUrl(article.imageUrl) ? "public" : "local",
    networks: {
      FACEBOOK: {
        connected: Boolean(connections.FACEBOOK),
        accountName: connections.FACEBOOK?.name || null,
        text: composePost("FACEBOOK", source),
        limit: TEXT_LIMIT.FACEBOOK,
        last: last.FACEBOOK,
      },
      INSTAGRAM: {
        connected: Boolean(connections.INSTAGRAM),
        accountName: connections.INSTAGRAM?.name || null,
        text: composePost("INSTAGRAM", source),
        limit: TEXT_LIMIT.INSTAGRAM,
        last: last.INSTAGRAM,
      },
      X: {
        connected: Boolean(connections.X),
        accountName: connections.X?.name || null,
        text: composePost("X", source),
        limit: TEXT_LIMIT.X,
        last: last.X,
      },
    },
  });
}
