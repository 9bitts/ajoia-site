export const SEO_TITLE_MIN = 50;
export const SEO_TITLE_MAX = 70;
export const SEO_DESCRIPTION_MIN = 120;
export const SEO_DESCRIPTION_MAX = 160;

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
