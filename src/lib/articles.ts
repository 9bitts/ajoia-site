import type { Article, User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSectionImage } from "@/lib/images";
import type { SectionSlug } from "@/lib/sections";
import { isSectionSlug } from "@/lib/sections";

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
  imageGradient: string;
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
    imageGradient: "from-zinc-800 via-neutral-900 to-black",
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

export async function getLatestArticles(limit = 12) {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map(mapArticle);
}

export async function getFeaturedArticles(limit = 8) {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED", featured: true },
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
    where: { status: "PUBLISHED", section },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(mapArticle);
}

export async function getArticlesByAuthor(authorSlug: string) {
  const rows = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      author: { slug: authorSlug, active: true },
    },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(mapArticle);
}

export async function getColumnists() {
  const rows = await prisma.user.findMany({
    where: { role: "COLUMNIST", active: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
  return rows.map(mapColumnist);
}

export async function getColumnistBySlug(slug: string) {
  const row = await prisma.user.findFirst({
    where: { slug, role: "COLUMNIST", active: true },
  });
  return row ? mapColumnist(row) : null;
}

export async function getPublishedSlugs() {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export async function getColumnistSlugs() {
  const rows = await prisma.user.findMany({
    where: { role: "COLUMNIST", active: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
