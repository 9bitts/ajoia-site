import { siteConfig } from "@/data/site";
import { getFeedArticles } from "@/lib/articles";
import { sectionMeta, type SectionSlug } from "@/lib/sections";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import { xmlEscape } from "@/lib/xml";

export async function renderFeed(section?: SectionSlug) {
  const articles = await getFeedArticles(section);
  const title = section
    ? `${sectionMeta[section].label} · ${siteConfig.name}`
    : siteConfig.name;
  const description = section
    ? sectionMeta[section].description
    : siteConfig.description;
  const selfPath = section ? `/secao/${section}/feed.xml` : "/feed.xml";
  const link = section ? absoluteUrl(`/secao/${section}`) : siteUrl();

  const items = articles
    .map((article) => {
      const itemLink = absoluteUrl(`/artigo/${article.slug}`);
      const pub = new Date(article.publishedAt).toUTCString();
      return `    <item>
      <title>${xmlEscape(article.title)}</title>
      <link>${xmlEscape(itemLink)}</link>
      <guid isPermaLink="true">${xmlEscape(itemLink)}</guid>
      <pubDate>${xmlEscape(pub)}</pubDate>
      <description>${xmlEscape(article.dek)}</description>
      <category>${xmlEscape(sectionMeta[article.section].label)}</category>
      <dc:creator>${xmlEscape(article.authorName)}</dc:creator>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${xmlEscape(link)}</link>
    <description>${xmlEscape(description)}</description>
    <language>pt-br</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${xmlEscape(absoluteUrl(selfPath))}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}
