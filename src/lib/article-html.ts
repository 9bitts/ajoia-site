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

export function sanitizeArticleHtml(html: string) {
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
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "title", "allow", "allowfullscreen", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
    transformTags: {
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
