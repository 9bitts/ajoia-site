import { NextResponse } from "next/server";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { publishedBySlugs } from "@/lib/store";

export async function GET(req: Request) {
  const ip = clientIp(req);
  if (await isRateLimited(`store-cart:${ip}`, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas consultas. Tente de novo em instantes." }, { status: 429 });
  }

  const url = new URL(req.url);
  const slugs = (url.searchParams.get("slugs") || "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, 30);

  const items = await publishedBySlugs(slugs);
  return NextResponse.json({
    items: items.map((item) => ({
      slug: item.slug,
      name: item.name,
      priceCents: item.priceCents,
      stock: item.stock,
      coverUrl: item.coverUrl,
      coverAlt: item.coverAlt,
      kind: item.kind,
      authors: item.authors,
    })),
  });
}
