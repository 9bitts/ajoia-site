import { readdir, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getUploadDir } from "@/lib/upload-dir";

const FILE = /\.(jpe?g|png|webp|gif|avif|mp4|webm)$/i;
const SRC = /(?:src)=["'](\/(?:uploads|images|media)\/[^"']+)["']/gi;

export function isLibraryUrl(url: string) {
  return (
    url.startsWith("/uploads/") ||
    url.startsWith("/images/") ||
    url.startsWith("/media/")
  );
}

export async function recordMedia(input: {
  url: string;
  alt?: string;
  bytes?: number;
  userId?: string | null;
}) {
  if (!isLibraryUrl(input.url) || input.url.includes("..")) return;
  await prisma.mediaAsset.upsert({
    where: { url: input.url },
    create: {
      url: input.url,
      alt: input.alt?.trim() || "",
      bytes: input.bytes ?? 0,
      userId: input.userId || null,
    },
    update: input.alt?.trim()
      ? { alt: input.alt.trim() }
      : {},
  });
}

function collectSrc(html: string, into: Set<string>) {
  for (const match of html.matchAll(SRC)) {
    const url = match[1];
    if (url && isLibraryUrl(url)) into.add(url);
  }
}

/** Inclui arquivos já enviados e os que aparecem em matérias e colunistas. */
export async function syncMediaLibrary() {
  const urls = new Set<string>();
  try {
    const files = await readdir(getUploadDir());
    for (const file of files) {
      if (FILE.test(file) && !file.includes("..") && !file.includes("/") && !file.includes("\\")) {
        urls.add(`/uploads/${file}`);
      }
    }
  } catch {
    // pasta ainda vazia
  }

  const [articles, users] = await Promise.all([
    prisma.article.findMany({
      select: {
        imageUrl: true,
        body: true,
        gallery: { select: { url: true } },
      },
    }),
    prisma.user.findMany({
      where: { avatarUrl: { not: null } },
      select: { avatarUrl: true },
    }),
  ]);

  for (const article of articles) {
    if (article.imageUrl && isLibraryUrl(article.imageUrl)) urls.add(article.imageUrl);
    collectSrc(article.body, urls);
    for (const image of article.gallery) {
      if (isLibraryUrl(image.url)) urls.add(image.url);
    }
  }
  for (const user of users) {
    if (user.avatarUrl && isLibraryUrl(user.avatarUrl)) urls.add(user.avatarUrl);
  }

  const existing = await prisma.mediaAsset.findMany({ select: { url: true } });
  const known = new Set(existing.map((row) => row.url));
  const fresh = [...urls].filter((url) => !known.has(url));
  if (fresh.length) {
    await prisma.mediaAsset.createMany({
      data: fresh.map((url) => ({ url })),
      skipDuplicates: true,
    });
  }
}

export async function mediaUsages(url: string) {
  const [articles, users] = await Promise.all([
    prisma.article.findMany({
      where: {
        OR: [
          { imageUrl: url },
          { body: { contains: url } },
          { gallery: { some: { url } } },
        ],
      },
      select: { id: true, title: true, slug: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.user.findMany({
      where: { avatarUrl: url },
      select: { id: true, name: true },
    }),
  ]);
  return { articles, users };
}

export async function deleteMediaFile(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const filename = url.slice("/uploads/".length);
  if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return;
  }
  await unlink(path.join(getUploadDir(), filename)).catch(() => undefined);
}
