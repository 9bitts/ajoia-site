import type { Article, User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSectionImage } from "@/lib/images";
import {
  isSectionSlug,
  sectionDefaultsToOpinion,
  type SectionSlug,
} from "@/lib/sections";

export type PublicArticle = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body: string[];
  section: SectionSlug;
  authorSlug: string;
  authorName: string;
  date: string;
  featured: boolean;
  breaking: boolean;
  image?: string;
  imageAlt: string;
  imageGradient: string;
  seoTitle: string;
  seoDescription: string;
  noindex: boolean;
  isOpinion: boolean;
  publishedAt: string;
  updatedAt: string;
};

export type PublicColumnist = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  featured?: boolean;
};

type ArticleWithAuthor = Article & { author: User };

function toDateIso(date: Date | null | undefined) {
  if (!date) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function mapArticle(article: ArticleWithAuthor): PublicArticle {
  const section = isSectionSlug(article.section)
    ? article.section
    : ("tema-livre" as SectionSlug);

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    body: article.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    section,
    authorSlug: article.author.slug,
    authorName: article.author.name,
    date: toDateIso(article.publishedAt ?? article.createdAt),
    featured: article.featured,
    breaking: article.breaking,
    image: article.imageUrl || getSectionImage(section),
    imageAlt: article.imageAlt,
    imageGradient: "from-zinc-800 via-neutral-900 to-black",
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    noindex: article.noindex,
    isOpinion: article.isOpinion ?? sectionDefaultsToOpinion(section),
    publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

export function mapColumnist(user: User): PublicColumnist {
  return {
    slug: user.slug,
    name: user.name,
    role: user.roleLabel,
    bio: user.bio,
    featured: user.featured,
  };
}

const publicWhere = { status: "PUBLISHED" as const, noindex: false };

export async function getLatestArticles(limit = 12) {
  const rows = await prisma.article.findMany({
    where: publicWhere,
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map(mapArticle);
}

export async function getFeaturedArticles(limit = 8) {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED", noindex: false, featured: true },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  if (rows.length > 0) return rows.map(mapArticle);
  return getLatestArticles(limit);
}

export async function getArticleBySlug(slug: string) {
  const row = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: true },
  });
  return row ? mapArticle(row) : null;
}

export async function getArticlesBySection(section: SectionSlug) {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED", noindex: false, section },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(mapArticle);
}

export async function getArticlesByAuthor(authorSlug: string) {
  const rows = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      noindex: false,
      author: { slug: authorSlug, active: true },
    },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(mapArticle);
}

export async function getColumnists() {
  const rows = await prisma.user.findMany({
    where: { role: "COLUMNIST", active: true, approved: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
  return rows.map(mapColumnist);
}

export async function getColumnistBySlug(slug: string) {
  const row = await prisma.user.findFirst({
    where: { slug, role: "COLUMNIST", active: true, approved: true },
  });
  return row ? mapColumnist(row) : null;
}

export async function getSitemapArticles() {
  return prisma.article.findMany({
    where: publicWhere,
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getNewsSitemapArticles() {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
  return prisma.article.findMany({
    where: {
      ...publicWhere,
      publishedAt: { gte: since },
    },
    select: { slug: true, title: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 1000,
  });
}

export async function getFeedArticles(section?: SectionSlug) {
  const rows = await prisma.article.findMany({
    where: section ? { ...publicWhere, section } : publicWhere,
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });
  return rows.map(mapArticle);
}

export async function getColumnistSlugs() {
  const rows = await prisma.user.findMany({
    where: { role: "COLUMNIST", active: true, approved: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
