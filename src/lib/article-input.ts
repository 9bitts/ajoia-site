import { z } from "zod";

export const articleInputSchema = z.object({
  title: z.string().min(3),
  dek: z.string().default(""),
  body: z.string().min(10),
  section: z.string(),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED"]),
  featured: z.boolean().optional(),
  breaking: z.boolean().optional(),
  imageUrl: z.string().nullable().optional(),
  imageAlt: z.string().max(300).default(""),
  seoTitle: z.string().max(120).default(""),
  seoDescription: z.string().max(220).default(""),
  noindex: z.boolean().optional(),
  isOpinion: z.boolean().optional(),
  slug: z.string().optional(),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;

export function articleSeoData(
  data: ArticleInput,
  role: string,
  existingNoindex = false
) {
  return {
    imageAlt: data.imageAlt.trim(),
    seoTitle: data.seoTitle.trim(),
    seoDescription: data.seoDescription.trim(),
    isOpinion: Boolean(data.isOpinion),
    noindex: role === "ADMIN" ? Boolean(data.noindex) : existingNoindex,
  };
}
