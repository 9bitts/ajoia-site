const ID = /^[a-zA-Z0-9_-]{11}$/;

/** Aceita o link comum, o curto, o embed e o shorts. Devolve o iframe seguro. */
export function youtubeEmbedUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let id = "";
  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) {
        id = url.pathname.split("/")[2] || "";
      } else {
        id = url.searchParams.get("v") || "";
      }
    }
  } catch {
    return null;
  }
  if (!ID.test(id)) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
