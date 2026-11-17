import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/site-url";
import { isSectionSlug, sectionDefaultsToOpinion, sectionMeta } from "@/lib/sections";
import type { SocialNetwork } from "@/lib/social/copy";

export async function loadSocialArticle(id: string) {
  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      dek: true,
      body: true,
      section: true,
      isOpinion: true,
      imageUrl: true,
      slug: true,
      status: true,
    },
  });
  if (!article) return null;
  const sectionLabel = isSectionSlug(article.section)
    ? sectionMeta[article.section].label
    : article.section;
  return {
    ...article,
    opinion: article.isOpinion ?? sectionDefaultsToOpinion(article.section),
    sectionLabel,
    url: absoluteUrl(`/artigo/${article.slug}`),
  };
}

export async function lastPublications(articleId: string) {
  const rows = await prisma.socialPublication.findMany({
    where: { articleId },
    orderBy: { createdAt: "desc" },
  });
  const last = (network: SocialNetwork) => {
    const row = rows.find((item) => item.network === network);
    if (!row) return null;
    return {
      ok: row.ok,
      url: row.externalUrl,
      error: row.error,
      at: row.createdAt.toISOString(),
    };
  };
  return {
    FACEBOOK: last("FACEBOOK"),
    INSTAGRAM: last("INSTAGRAM"),
    X: last("X"),
  };
}

export function articleImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;
  const absolute = absoluteUrl(imageUrl);
  if (!absolute.startsWith("https://")) return null;
  return absolute;
}
