import { z } from "zod";

export const articleInputSchema = z.object({
  title: z.string().trim().min(3).max(300),
  dek: z.string().max(2000).default(""),
  body: z.string().trim().min(10).max(400_000),
  section: z.string().max(40),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED"]),
  featured: z.boolean().optional(),
  principal: z.boolean().optional(),
  breaking: z.boolean().optional(),
  imageUrl: z.string().max(300).nullable().optional(),
  imageAlt: z.string().max(300).default(""),
  seoTitle: z.string().max(120).default(""),
  seoDescription: z.string().max(220).default(""),
  noindex: z.boolean().optional(),
  isOpinion: z.boolean().optional(),
  slug: z.string().optional(),
  secondarySections: z.array(z.string().max(40)).max(12).optional(),
  gallery: z
    .array(
      z.object({
        url: z.string().max(300),
        caption: z.string().max(300).optional().default(""),
      })
    )
    .max(40)
    .optional(),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;

export function articleInputError(error: z.ZodError) {
  const issue = error.issues[0];
  const field = issue?.path[0];
  if (field === "title") return "O título precisa ter pelo menos 3 caracteres.";
  if (field === "body") return "Escreva o texto da matéria antes de salvar.";
  if (field === "section") return "Escolha uma seção.";
  if (field === "dek") return "A linha-fina passou do limite.";
  if (field === "seoTitle") return "O título do Google passou do limite.";
  if (field === "seoDescription") return "A descrição do Google passou do limite.";
  if (field === "imageAlt") return "A descrição da imagem passou do limite.";
  if (field === "imageUrl") return "A imagem precisa ser um arquivo enviado pela redação.";
  return "Dados inválidos. Revise título, texto e seção.";
}

export function principalConflict(input: {
  role: string;
  principal?: boolean;
  noindex?: boolean;
  status: string;
}) {
  if (input.role !== "ADMIN" || input.status !== "PUBLISHED" || !input.principal) {
    return null;
  }
  if (input.noindex) {
    return "A matéria principal entra na capa. Desmarque “Não indexar” para publicar assim.";
  }
  return null;
}

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
