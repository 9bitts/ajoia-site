import { renderFeed } from "@/lib/feeds";
import { xmlResponse } from "@/lib/xml";

export const dynamic = "force-dynamic";

export async function GET() {
  return xmlResponse(await renderFeed(), "application/rss+xml");
}
