import { siteConfig } from "@/data/site";
import { getNewsSitemapArticles } from "@/lib/articles";
import { absoluteUrl } from "@/lib/site-url";
import { newsUrlSet, xmlResponse } from "@/lib/xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await getNewsSitemapArticles();
  return xmlResponse(
    newsUrlSet(
      siteConfig.name,
      articles.flatMap((article) =>
        article.publishedAt
          ? [
              {
                loc: absoluteUrl(`/artigo/${article.slug}`),
                title: article.title,
                publishedAt: article.publishedAt,
              },
            ]
          : []
      )
    ),
    "application/xml"
  );
}
