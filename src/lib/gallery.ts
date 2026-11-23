import type { Prisma } from "@prisma/client";
import { imageUrlError } from "@/lib/image-url";

export type GalleryItem = {
  url: string;
  caption: string;
};

export function parseGalleryJson(value: string | null | undefined): GalleryItem[] {
  if (!value) return [];
  try {
    return sanitizeGallery(JSON.parse(value)).items;
  } catch {
    return [];
  }
}

export function sanitizeGallery(input: unknown): { items: GalleryItem[]; error?: string } {
  if (input == null) return { items: [] };
  if (!Array.isArray(input)) return { items: [], error: "Galeria inválida." };
  if (input.length > 40) {
    return { items: [], error: "A galeria aceita até 40 fotos." };
  }
  const items: GalleryItem[] = [];
  for (const row of input) {
    if (!row || typeof row !== "object") return { items: [], error: "Galeria inválida." };
    const url = String((row as { url?: unknown }).url || "").trim();
    const caption = String((row as { caption?: unknown }).caption || "").trim();
    const imageError = imageUrlError(url);
    if (!url || imageError) {
      return { items: [], error: imageError || "A foto da galeria precisa ser um arquivo enviado pela redação." };
    }
    if (!/\.(jpe?g|png|webp|gif|avif)$/i.test(url.split("?")[0] || "")) {
      return { items: [], error: "A galeria aceita apenas fotos." };
    }
    if (caption.length > 300) {
      return { items: [], error: "A legenda da foto passou do limite." };
    }
    items.push({ url, caption });
  }
  return { items };
}

export function galleryJson(items: GalleryItem[]) {
  return JSON.stringify(items);
}

export async function replaceArticleGallery(
  tx: Prisma.TransactionClient,
  articleId: string,
  items: GalleryItem[]
) {
  await tx.articleGalleryImage.deleteMany({ where: { articleId } });
  if (!items.length) return;
  await tx.articleGalleryImage.createMany({
    data: items.map((item, position) => ({
      articleId,
      url: item.url,
      caption: item.caption,
      position,
    })),
  });
}
