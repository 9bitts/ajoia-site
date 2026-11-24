import sanitizeHtml from "sanitize-html";

const HTML_TAG = /<\/?[a-z][\s\S]*>/i;
function blockPattern() {
  return /<(h[1-6]|ul|ol|blockquote|table|pre|figure|iframe|video|p)\b[^>]*>[\s\S]*?<\/\1>|<hr\b[^>]*\/?>/gi;
}

const MEDIA_SPLIT =
  /(<(?:figure|iframe|video)\b[^>]*>[\s\S]*?<\/(?:figure|iframe|video)>)/gi;

export function isHtmlBody(body: string) {
  return HTML_TAG.test(body);
}

function visibleText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&gt;/gi, ">")
    .replace(/&lt;/gi, "<")
    .replace(/\s+/g, " ")
    .trim();
}

/** Linha que é item de lista, não um parágrafo de notícia. */
function lineKind(line: string) {
  const text = visibleText(line);
  if (!text) return "prose" as const;
  if (/^[✓✔✅•]/.test(text)) return "item" as const;
  if (/^\d{3,4}:\s+\S/.test(text) && text.length < 500) return "item" as const;
  if (
    /^(?:\p{Extended_Pictographic}|\p{Regional_Indicator})/u.test(text) &&
    text.length <= 140 &&
    !/[.!?]$/.test(text)
  ) {
    return "item" as const;
  }
  return "prose" as const;
}

function polishInline(value: string) {
  return value
    .replace(/([✓✔✅•])(?=\S)/gu, "$1 ")
    .replace(/(\p{Extended_Pictographic})(?=\p{L})/gu, "$1 ");
}

function asItem(line: string) {
  return polishInline(line.trim()).replace(/^(?:[✓✔✅•]\s*)+/, "").trim();
}

function endsSentence(text: string) {
  return /[.!?…]["”»')\]]*$/.test(text) || /[:;]$/.test(text);
}

function closeSentence(html: string) {
  const text = visibleText(html);
  if (text.length < 80 || endsSentence(text)) return html;
  return `${html.replace(/\s+$/, "")}.`;
}

function expandChecks(line: string) {
  if ((visibleText(line).match(/[✓✔]/g) || []).length < 2) return [line];
  return line
    .split(/(?=[✓✔])/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function blocksFromLines(lines: string[]) {
  const html: string[] = [];
  let items: string[] = [];
  const flush = () => {
    if (!items.length) return;
    html.push(`<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`);
    items = [];
  };
  for (const line of lines) {
    if (lineKind(line) === "item") {
      const item = asItem(line);
      if (item) items.push(item);
      continue;
    }
    flush();
    const prose = polishInline(line.trim());
    if (prose) html.push(`<p>${closeSentence(prose)}</p>`);
  }
  flush();
  return html.join("\n");
}

function linesOf(raw: string) {
  return raw
    .replace(/^(?:\s|<br\s*\/?>)*/gi, "")
    .replace(/(?:\s|<br\s*\/?>)*$/gi, "")
    .split(/\n|<br\s*\/?>/i)
    .map((line) => line.trim())
    .filter((line) => line && line !== "&nbsp;")
    .flatMap(expandChecks);
}

/** Dois fatos do mesmo ano grudados com ">" viram dois itens. */
function splitJoinedFacts(inner: string) {
  if (/<(?!br\b)[^>]+>/i.test(inner)) return null;
  if (!/&gt;|>/.test(inner)) return null;
  const pieces = inner
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&gt;/g, ">")
    .split(/\s*>\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (pieces.length < 2) return null;
  const yearMatch = pieces[0].match(/^(\d{3,4})\s*:\s*(.*)$/);
  if (!yearMatch) return null;
  const year = yearMatch[1];
  const items: string[] = [];
  const first = yearMatch[2].replace(/[;\s]+$/, "").trim();
  if (first) items.push(`${year}: ${first}`);
  for (const piece of pieces.slice(1)) {
    const cleaned = piece.replace(/[;\s]+$/, "").trim();
    if (!cleaned) continue;
    items.push(/^\d{3,4}\s*:/.test(cleaned) ? cleaned : `${year}: ${cleaned}`);
  }
  return items.length >= 2 ? items : null;
}

function repairAroundMedia(inner: string) {
  if (!/<(?:figure|iframe|video)\b/i.test(inner)) return "";
  return inner
    .split(MEDIA_SPLIT)
    .map((part) => {
      if (/^<(?:figure|iframe|video)\b/i.test(part)) return part;
      const lines = linesOf(part);
      if (!lines.length) return "";
      return blocksFromLines(lines);
    })
    .filter(Boolean)
    .join("\n");
}

function repairParagraph(block: string) {
  const inner = block.replace(/^<p\b[^>]*>/i, "").replace(/<\/p>\s*$/i, "");
  const aroundMedia = repairAroundMedia(inner);
  if (aroundMedia) return aroundMedia;
  const lines = linesOf(inner);
  if (!lines.length) return "";
  const itemCount = lines.filter((line) => lineKind(line) === "item").length;
  if (itemCount >= 2) return blocksFromLines(lines);
  if (lines.length === 1) return `<p>${closeSentence(polishInline(lines[0]))}</p>`;
  return `<p>${closeSentence(polishInline(inner.trim()))}</p>`;
}

function repairList(block: string) {
  const tag = /^<ol\b/i.test(block) ? "ol" : "ul";
  const items: string[] = [];
  for (const li of block.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const split = splitJoinedFacts(li[1]);
    const parts = split ?? [li[1].trim()];
    for (const part of parts) {
      let item = asItem(part);
      if (split && visibleText(item) && !/[.!?]$/.test(visibleText(item))) {
        item = `${item.replace(/[;\s]+$/, "")}.`;
      }
      if (visibleText(item)) items.push(`<li>${item}</li>`);
    }
  }
  if (!items.length) return "";
  return `<${tag}>${items.join("")}</${tag}>`;
}

function repairBlock(block: string) {
  if (/^<p\b/i.test(block)) return repairParagraph(block);
  if (/^<(ul|ol)\b/i.test(block)) return repairList(block);
  return block;
}

function repairGap(raw: string) {
  const lines = linesOf(raw);
  if (!lines.length) return "";
  return blocksFromLines(lines);
}

/** Listas coladas e texto solto depois do intertítulo voltam a ser parágrafo ou item. */
export function repairArticleHtml(html: string) {
  const source = html.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!source) return "";
  let out = "";
  let last = 0;
  for (const match of source.matchAll(blockPattern())) {
    const index = match.index ?? 0;
    out += repairGap(source.slice(last, index));
    out += repairBlock(match[0]);
    last = index + match[0].length;
  }
  out += repairGap(source.slice(last));
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

export function normalizeArticleHtml(html: string) {
  const normalized = html.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return "";
  if (!isHtmlBody(normalized)) {
    const parts = normalized
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `<p>${part.replace(/\n/g, "<br />")}</p>`);
    return repairArticleHtml(parts.join("\n"));
  }
  return repairArticleHtml(normalized);
}

/**
 * Linha-fina cortada no meio da lista não entra na página nem no Google.
 * No lugar, a primeira frase de fato da matéria.
 */
export function presentableDek(dek: string, body: string) {
  const clean = dek.replace(/\s+/g, " ").trim();
  const checks = (clean.match(/[✓✔]/g) || []).length;
  const cut = /(?:…|\.{3})\s*$/.test(clean);
  const hasSentence = /[.!?]/.test(clean.replace(/(?:…|\.{3})\s*$/, ""));
  const broken = checks >= 2 || (cut && !hasSentence && clean.length > 120);
  if (clean && !broken) return clean;

  const plain = body
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|h[1-6]|li|div|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&gt;/gi, ">")
    .replace(/&lt;/gi, "<");

  for (const raw of plain.split(/\n/)) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (/[✓✔]/.test(line) || line.length < 60 || lineKind(line) === "item") {
      continue;
    }
    let chosen = (line.split(/;\s+/)[0] || line).trim();
    chosen = chosen.replace(/^[^\p{L}\d]+/u, "").replace(/[;,\s]+$/, "");
    if (!/[.!?]$/.test(chosen)) chosen += ".";
    if (chosen.length > 160) {
      const slice = chosen.slice(0, 157);
      const space = slice.lastIndexOf(" ");
      chosen = `${(space > 80 ? slice.slice(0, space) : slice).replace(/[\s,;:]+$/, "")}.`;
    }
    if (chosen.length >= 40) return chosen;
  }

  return clean
    .replace(/(?:…|\.{3})\s*$/, "")
    .replace(/\s*[✓✔].*$/, "")
    .trim();
}

export function sanitizeStoredBody(body: string) {
  if (!isHtmlBody(body)) return body;
  return sanitizeArticleHtml(body);
}

const LOCAL_IMAGE = /^\/(?:uploads|media|images)\//;
const GENERATED_NAME =
  /^(chatgpt|gemini|copilot|img|image|foto|photo|dsc|pxl|screenshot|quadro)\b/i;

function filenameAlt(src: string) {
  const file = src.split("?")[0]?.split("/").pop() || "";
  let base = file.replace(/\.[a-z0-9]+$/i, "");
  try {
    base = decodeURIComponent(base);
  } catch {
    return "";
  }
  const words = base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  if (words.length < 3 || GENERATED_NAME.test(words)) return "";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function imageAlt(attribs: Record<string, string>, fallback: string) {
  const current = attribs.alt?.trim();
  if (current) return current;
  const titled = attribs.title?.trim();
  if (titled) return titled;
  return filenameAlt(attribs.src || "") || fallback || "Imagem da matéria";
}

function displaySrc(src: string) {
  if (!LOCAL_IMAGE.test(src) || src.startsWith("/img?")) return src;
  const params = new URLSearchParams({ src, w: "1200", q: "75" });
  return `/img?${params.toString()}`;
}

function isExternalHref(href: string) {
  if (
    !href ||
    href.startsWith("/") ||
    href.startsWith("#") ||
    href.startsWith("mailto:")
  ) {
    return false;
  }
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    return host !== "ajoiabrasil.com.br";
  } catch {
    return true;
  }
}

export function sanitizeArticleHtml(html: string, imageAltFallback = "") {
  const fallback = imageAltFallback.trim();
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "figure",
      "figcaption",
      "iframe",
      "video",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
      iframe: ["src", "title", "allow", "allowfullscreen", "loading"],
      video: ["src", "controls", "preload"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
    transformTags: {
      h1: () => ({ tagName: "h2", attribs: {} }),
      img: (_tagName, attribs) => ({
        tagName: "img",
        attribs: {
          ...attribs,
          alt: imageAlt(attribs, fallback),
          src: displaySrc(attribs.src || ""),
          loading: "lazy",
          decoding: "async",
        },
      }),
      video: (_tagName, attribs) => {
        const src = attribs.src || "";
        const local = /^\/uploads\/[a-zA-Z0-9._-]+\.(mp4|webm)$/.test(src);
        if (!local) return { tagName: "span", attribs: {} as Record<string, string> };
        return {
          tagName: "video",
          attribs: {
            src,
            controls: "controls",
            preload: "metadata",
          } as Record<string, string>,
        };
      },
      a: (tagName, attribs) => {
        const external = isExternalHref(attribs.href || "");
        const next: Record<string, string> = {};
        for (const [key, value] of Object.entries(attribs)) {
          if (key === "target" || key === "rel") continue;
          next[key] = value;
        }
        if (external) {
          next.rel = "noopener noreferrer";
          next.target = "_blank";
        }
        return { tagName, attribs: next };
      },
    },
  });
}
