import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { pingIndexNow } from "@/lib/indexnow";
import { absoluteUrl } from "@/lib/site-url";

type Status = "DRAFT" | "PENDING" | "PUBLISHED";

export function syncArticleSurfaces(opts: {
  slug: string;
  previousSlug?: string;
  section: string;
  previousSection?: string;
  authorSlug: string;
  status: Status;
}) {
  const paths = [
    "/",
    "/ultimas",
    "/colunistas",
    `/colunistas/${opts.authorSlug}`,
    `/secao/${opts.section}`,
    `/secao/${opts.section}/feed.xml`,
    `/artigo/${opts.slug}`,
    "/feed.xml",
    "/sitemap.xml",
    "/sitemap-pages.xml",
    "/sitemap-articles.xml",
    "/news-sitemap.xml",
  ];

  if (opts.previousSection && opts.previousSection !== opts.section) {
    paths.push(`/secao/${opts.previousSection}`);
    paths.push(`/secao/${opts.previousSection}/feed.xml`);
  }
  if (opts.previousSlug && opts.previousSlug !== opts.slug) {
    paths.push(`/artigo/${opts.previousSlug}`);
  }

  for (const path of paths) revalidatePath(path);

  if (opts.status !== "PUBLISHED") return;

  const urls = [absoluteUrl(`/artigo/${opts.slug}`)];
  if (opts.previousSlug && opts.previousSlug !== opts.slug) {
    urls.push(absoluteUrl(`/artigo/${opts.previousSlug}`));
  }
  after(() => pingIndexNow(urls));
}
