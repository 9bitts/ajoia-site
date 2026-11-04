import { absoluteUrl } from "@/lib/site-url";
import { sitemapIndex, xmlResponse } from "@/lib/xml";

export const dynamic = "force-dynamic";

export function GET() {
  return xmlResponse(
    sitemapIndex([
      absoluteUrl("/sitemap-pages.xml"),
      absoluteUrl("/sitemap-articles.xml"),
      absoluteUrl("/news-sitemap.xml"),
    ]),
    "application/xml"
  );
}
