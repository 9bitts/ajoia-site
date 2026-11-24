import { prisma } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";

const categoryPick = { slug: true, name: true } as const;

export const itemInclude = {
  category: { select: categoryPick },
} as const;

export async function uniqueItemSlug(base: string, ignoreId?: string) {
  return uniqueSlug(base, async (slug) => {
    const found = await prisma.storeItem.findUnique({ where: { slug }, select: { id: true } });
    return Boolean(found && found.id !== ignoreId);
  });
}

export async function uniqueCategorySlug(base: string, ignoreId?: string) {
  return uniqueSlug(base, async (slug) => {
    const found = await prisma.storeCategory.findUnique({
      where: { slug },
      select: { id: true },
    });
    return Boolean(found && found.id !== ignoreId);
  });
}

export async function getPublishedBySlug(slug: string) {
  return prisma.storeItem.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: itemInclude,
  });
}

export async function listPublishedHome() {
  const [featured, recent, categories] = await Promise.all([
    prisma.storeItem.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: itemInclude,
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.storeItem.findMany({
      where: { status: "PUBLISHED" },
      include: itemInclude,
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.storeCategory.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
    }),
  ]);
  return { featured, recent, categories };
}

export async function getCategoryBySlug(slug: string) {
  return prisma.storeCategory.findUnique({
    where: { slug },
    include: {
      items: {
        where: { status: "PUBLISHED" },
        include: itemInclude,
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function searchPublished(q: string) {
  const term = q.trim().slice(0, 80);
  if (term.length < 2) return [];
  const isbn = term.replace(/\D/g, "");
  return prisma.storeItem.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { authors: { contains: term, mode: "insensitive" } },
        { publisher: { contains: term, mode: "insensitive" } },
        ...(isbn.length >= 3 ? [{ isbn13: { contains: isbn } }] : []),
      ],
    },
    include: itemInclude,
    orderBy: { name: "asc" },
    take: 60,
  });
}

export async function publishedBySlugs(slugs: string[]) {
  const unique = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))].slice(0, 30);
  if (!unique.length) return [];
  return prisma.storeItem.findMany({
    where: { slug: { in: unique }, status: "PUBLISHED" },
    include: itemInclude,
  });
}

export async function listStoreSitemapPaths() {
  const [categories, items] = await Promise.all([
    prisma.storeCategory.findMany({ select: { slug: true } }),
    prisma.storeItem.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    }),
  ]);
  return [
    "/livraria",
    "/livraria/busca",
    ...categories.map((category) => `/livraria/c/${category.slug}`),
    ...items.map((item) => `/livraria/p/${item.slug}`),
  ];
}
