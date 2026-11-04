import { renderFeed } from "@/lib/feeds";
import { isSectionSlug } from "@/lib/sections";
import { xmlResponse } from "@/lib/xml";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  if (!isSectionSlug(slug)) {
    return new Response("Seção não encontrada", { status: 404 });
  }
  return xmlResponse(await renderFeed(slug), "application/rss+xml");
}
