import sanitizeHtml from "sanitize-html";

const HTML_TAG = /<\/?[a-z][\s\S]*>/i;
const BLOCK = /^(<\/?(?:p|div|h[1-6]|ul|ol|li|blockquote|figure|iframe|table|pre)\b)/i;

export function isHtmlBody(body: string) {
  return HTML_TAG.test(body);
}

export function normalizeArticleHtml(html: string) {
  const normalized = html.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const parts = normalized
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts
    .map((part) =>
      BLOCK.test(part) ? part : `<p>${part.replace(/\n/g, "<br />")}</p>`
    )
    .join("\n");
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
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
      iframe: ["src", "title", "allow", "allowfullscreen", "loading"],
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
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          ...(attribs.href?.startsWith("http") ? { target: "_blank" } : {}),
        },
      }),
    },
  });
}
