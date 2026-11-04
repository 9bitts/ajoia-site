import { getSitemapArticles } from "@/lib/articles";
import { absoluteUrl } from "@/lib/site-url";
import { urlSet, xmlResponse } from "@/lib/xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await getSitemapArticles();
  return xmlResponse(
    urlSet(
      articles.map((article) => ({
        loc: absoluteUrl(`/artigo/${article.slug}`),
        lastmod: article.updatedAt,
      }))
    ),
    "application/xml"
  );
}
