import { siteConfig } from "@/data/site";

export const SEO_TITLE_MIN = 50;
export const SEO_TITLE_MAX = 70;
export const SEO_DESCRIPTION_MIN = 120;
export const SEO_DESCRIPTION_MAX = 160;

/** Entra no <title> pelo template do layout. O limite vale para o título inteiro. */
export const SEARCH_TITLE_SUFFIX = ` · ${siteConfig.name}`;

export function fitSearchText(value: string, max: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const cut = slice.lastIndexOf(" ");
  const word = cut > Math.floor(max * 0.6) ? slice.slice(0, cut) : slice;
  return word.replace(/[\s.,;:!?–—-]+$/u, "").trim();
}

/** Manchete que, com a marca, cabe no resultado. A página continua com o título inteiro. */
export function fitSearchTitle(headline: string) {
  const budget = SEO_TITLE_MAX - SEARCH_TITLE_SUFFIX.length;
  return fitSearchText(headline, budget);
}

export function publishSeoError(input: {
  status: string;
  dek: string;
  imageAlt: string;
}) {
  if (input.status !== "PUBLISHED") return null;
  if (!input.dek.trim()) {
    return "A linha-fina entra como descrição no Google. Preencha antes de publicar.";
  }
  if (!input.imageAlt.trim()) {
    return "Descreva a imagem de capa antes de publicar. Esse texto é o alt da foto.";
  }
  return null;
}
