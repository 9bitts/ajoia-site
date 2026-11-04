export function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function sitemapIndex(locs: string[]) {
  const body = locs
    .map((loc) => `  <sitemap><loc>${xmlEscape(loc)}</loc></sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export function urlSet(urls: { loc: string; lastmod?: Date | null }[]) {
  const body = urls
    .map((url) => {
      const lastmod = url.lastmod
        ? `<lastmod>${xmlEscape(url.lastmod.toISOString())}</lastmod>`
        : "";
      return `  <url><loc>${xmlEscape(url.loc)}</loc>${lastmod}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function newsUrlSet(
  publicationName: string,
  urls: { loc: string; title: string; publishedAt: Date }[]
) {
  const body = urls
    .map(
      (url) => `  <url>
    <loc>${xmlEscape(url.loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${xmlEscape(publicationName)}</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${xmlEscape(url.publishedAt.toISOString())}</news:publication_date>
      <news:title>${xmlEscape(url.title)}</news:title>
    </news:news>
  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${body}
</urlset>
`;
}

export function xmlResponse(body: string, contentType: string) {
  return new Response(body, {
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
