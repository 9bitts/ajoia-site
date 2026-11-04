import { getColumnists } from "@/lib/articles";
import { navSections, institutionalLinks } from "@/data/site";
import { absoluteUrl } from "@/lib/site-url";
import { urlSet, xmlResponse } from "@/lib/xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const columnists = await getColumnists();
  const paths = [
    "/",
    "/ultimas",
    "/colunistas",
    "/assine",
    ...institutionalLinks.map((link) => link.href),
    ...navSections.map((section) => `/secao/${section.slug}`),
    ...columnists.map((columnist) => `/colunistas/${columnist.slug}`),
  ];

  return xmlResponse(
    urlSet(paths.map((path) => ({ loc: absoluteUrl(path) }))),
    "application/xml"
  );
}
