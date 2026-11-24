const ID = /^[a-zA-Z0-9_-]{11}$/;

/** Aceita o link comum, o curto, o embed e o shorts. */
export function youtubeId(input: string) {
  const trimmed = input.trim().replace(/&amp;/g, "&");
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
  return ID.test(id) ? id : null;
}

/** Devolve o endereço seguro do player. */
export function youtubeEmbedUrl(input: string) {
  const id = youtubeId(input);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

function poster(id: string) {
  return `<button type="button" class="yt-play" data-yt="${id}" aria-label="Assistir o vídeo"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" /><span class="yt-play-icon" aria-hidden="true"></span></button>`;
}

/**
 * Troca o iframe ou o link do YouTube pelo cartaz com o botão de play.
 * O clique abre o vídeo na própria página.
 */
export function youtubePosterHtml(html: string) {
  let next = html.replace(/<iframe\b([^>]*)>\s*<\/iframe>/gi, (tag, attrs: string) => {
    const src = /src="([^"]+)"/i.exec(attrs)?.[1] || "";
    const id = youtubeId(src);
    return id ? poster(id) : tag;
  });
  let prev = "";
  while (next !== prev) {
    prev = next;
    next = next.replace(
      /<a\b[^>]*href="([^"]+)"[^>]*>(?:(?!<a\b)[\s\S])*?<\/a>/gi,
      (tag, href: string) => {
        const id = youtubeId(href);
        return id ? poster(id) : tag;
      }
    );
  }
  prev = "";
  while (next !== prev) {
    prev = next;
    next = next.replace(
      /(<button type="button" class="yt-play" data-yt="([a-zA-Z0-9_-]{11})"[\s\S]*?<\/button>)(?:\s|<(?:\/)?(?:span|p|br)\b[^>]*>)*<button type="button" class="yt-play" data-yt="\2"[\s\S]*?<\/button>/gi,
      "$1"
    );
  }
  return next;
}
