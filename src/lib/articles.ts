import { existsSync } from "fs";
import path from "path";
import type { Article, User } from "@prisma/client";
import {
  normalizeArticleHtml,
  presentableDek,
  sanitizeArticleHtml,
} from "@/lib/article-html";
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
  html: string;
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
  avatarUrl?: string | null;
  featured?: boolean;
};

export type MoreArticleCard = {
  slug: string;
  title: string;
  section: SectionSlug;
  date: string;
  image?: string;
  imageAlt: string;
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
    dek: presentableDek(article.dek, article.body),
    html: sanitizeArticleHtml(
      normalizeArticleHtml(article.body),
      article.title
    ),
    body: [],
    section,
    authorSlug: article.author.slug,
    authorName: article.author.name,
    date: toDateIso(article.publishedAt ?? article.createdAt),
    featured: article.featured,
    breaking: article.breaking,
    image: coverImage(article.imageUrl, section),
    imageAlt: article.imageAlt,
    imageGradient: "from-zinc-800 via-neutral-900 to-black",
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription.trim()
      ? presentableDek(article.seoDescription, article.body)
      : "",
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
    avatarUrl: user.avatarUrl,
    featured: user.featured,
  };
}

const publicWhere = { status: "PUBLISHED" as const, noindex: false };

function coverImage(url: string | null, section: SectionSlug) {
  const fallback = getSectionImage(section);
  if (!url || !url.startsWith("/") || url.startsWith("//")) return fallback;
  if (url.startsWith("/uploads/")) return url;
  const file = path.join(process.cwd(), "public", url);
  return existsSync(file) ? url : fallback;
}

export async function getTickerArticle() {
  const featured = await prisma.article.findFirst({
    where: { ...publicWhere, featured: true },
    include: { author: true },
    orderBy: { updatedAt: "desc" },
  });
  if (featured) return mapArticle(featured);
  const latest = await getLatestArticles(1);
  return latest[0] ?? null;
}

export async function getMoreArticles(offset: number, excludeSlug?: string) {
  const take = 20;
  const skip = Math.max(0, Math.min(offset, 5000));
  const rows = await prisma.article.findMany({
    where: {
      ...publicWhere,
      ...(excludeSlug ? { NOT: { slug: excludeSlug } } : {}),
    },
    select: {
      slug: true,
      title: true,
      section: true,
      imageUrl: true,
      imageAlt: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: { publishedAt: "desc" },
    skip,
    take: take + 1,
  });
  const hasMore = rows.length > take;
  const articles: MoreArticleCard[] = rows.slice(0, take).map((article) => {
    const section = isSectionSlug(article.section) ? article.section : "tema-livre";
    return {
      slug: article.slug,
      title: article.title,
      section,
      date: toDateIso(article.publishedAt ?? article.createdAt),
      image: coverImage(article.imageUrl, section),
      imageAlt: article.imageAlt || article.title,
    };
  });
  return { articles, hasMore };
}

export async function getArticleGallery(articleId: string) {
  const rows = await prisma.articleGalleryImage.findMany({
    where: { articleId },
    orderBy: { position: "asc" },
  });
  return rows.map((row) => ({ url: row.url, caption: row.caption }));
}

export async function getLatestArticles(limit = 12) {
  const rows = await prisma.article.findMany({
    where: publicWhere,
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map(mapArticle);
}

export async function getPrincipalArticle() {
  const row = await prisma.article.findFirst({
    where: { status: "PUBLISHED", noindex: false, principal: true },
    include: { author: true },
    orderBy: { updatedAt: "desc" },
  });
  return row ? mapArticle(row) : null;
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

export const ARCHIVE_PAGE_SIZE = 30;

export function archivePage(value: string | undefined) {
  const page = Number(value);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.floor(page), 500);
}

export async function getPublishedPage(opts: {
  page: number;
  section?: SectionSlug;
  authorSlug?: string;
}) {
  const where = opts.section
    ? inSection(opts.section)
    : opts.authorSlug
      ? {
          ...publicWhere,
          author: { slug: opts.authorSlug, active: true },
        }
      : publicWhere;
  const page = Math.max(1, opts.page);
  const [total, rows] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      include: { author: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * ARCHIVE_PAGE_SIZE,
      take: ARCHIVE_PAGE_SIZE,
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / ARCHIVE_PAGE_SIZE));
  return { articles: rows.map(mapArticle), total, pages };
}

export type AuthorProfile = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string | null;
};

export async function getAuthorProfile(slug: string) {
  const row = await prisma.user.findFirst({
    where: { slug, active: true },
    select: {
      slug: true,
      name: true,
      roleLabel: true,
      bio: true,
      avatarUrl: true,
    },
  });
  if (!row) return null;
  const profile: AuthorProfile = {
    slug: row.slug,
    name: row.name,
    role: row.roleLabel,
    bio: row.bio.trim(),
    avatarUrl: row.avatarUrl,
  };
  return profile;
}

function inSection(section: SectionSlug) {
  return {
    ...publicWhere,
    OR: [{ section }, { secondarySections: { has: section } }],
  };
}

export async function getArticlesBySection(section: SectionSlug) {
  const rows = await prisma.article.findMany({
    where: inSection(section),
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
    where: section ? inSection(section) : publicWhere,
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
