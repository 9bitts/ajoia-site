import { getColumnists } from "@/lib/articles";
import { navSections, institutionalLinks } from "@/data/site";
import { absoluteUrl } from "@/lib/site-url";
import { listStoreSitemapPaths } from "@/lib/store";
import { urlSet, xmlResponse } from "@/lib/xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const [columnists, storePaths] = await Promise.all([
    getColumnists(),
    listStoreSitemapPaths(),
  ]);
  const paths = [
    "/",
    "/ultimas",
    "/colunistas",
    "/assine",
    ...institutionalLinks.map((link) => link.href),
    ...navSections.map((section) => `/secao/${section.slug}`),
    ...columnists.map((columnist) => `/colunistas/${columnist.slug}`),
    ...storePaths,
  ];

  return xmlResponse(
    urlSet(paths.map((path) => ({ loc: absoluteUrl(path) }))),
    "application/xml"
  );
}
