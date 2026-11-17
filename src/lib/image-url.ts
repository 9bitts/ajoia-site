export function isAllowedImageUrl(url: string) {
  if (!url.startsWith("/") || url.startsWith("//") || url.includes("\\") || url.includes("..")) {
    return false;
  }
  return url.startsWith("/uploads/") || url.startsWith("/images/");
}

export function imageUrlError(url: string | null | undefined) {
  if (!url) return null;
  if (isAllowedImageUrl(url)) return null;
  return "A imagem precisa ser um arquivo enviado pela redação.";
}
