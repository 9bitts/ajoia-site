export type SocialNetwork = "FACEBOOK" | "INSTAGRAM" | "X";

export const TEXT_LIMIT: Record<SocialNetwork, number> = {
  X: 270,
  FACEBOOK: 1800,
  INSTAGRAM: 2100,
};

export function plainText(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function chars(text: string) {
  return [...text];
}

export function clip(text: string, max: number) {
  const flat = text.trim();
  if (chars(flat).length <= max) return flat;
  let cut = chars(flat)
    .slice(0, Math.max(0, max - 1))
    .join("");
  const space = cut.lastIndexOf(" ");
  if (space > cut.length * 0.6) cut = cut.slice(0, space);
  return `${cut.trimEnd()}…`;
}

function excerpt(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (chars(clean).length <= max) return clean;
  const slice = chars(clean).slice(0, max).join("");
  const sentence = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? ")
  );
  if (sentence > max * 0.5) return slice.slice(0, sentence + 1);
  return clip(clean, max);
}

export function weightedLength(text: string) {
  const re = /https?:\/\/\S+/gi;
  let weight = 0;
  let last = 0;
  for (const match of text.matchAll(re)) {
    const index = match.index ?? 0;
    weight += chars(text.slice(last, index)).length;
    weight += 23;
    last = index + match[0].length;
  }
  weight += chars(text.slice(last)).length;
  return weight;
}

function fitX(body: string, url: string) {
  const candidate = body ? `${body}\n${url}` : url;
  if (weightedLength(candidate) <= 280) return candidate;
  const units = chars(body);
  let lo = 0;
  let hi = units.length;
  let best = url;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const head = units.slice(0, mid).join("").trimEnd();
    const next = head ? `${head}…\n${url}` : url;
    if (weightedLength(next) <= 280) {
      best = next;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

function joinLimited(body: string, tail: string, max: number) {
  if (!body) return clip(tail, max);
  const room = max - chars(tail).length;
  if (room < 40) return clip(`${body}${tail}`, max);
  return `${clip(body, room)}${tail}`;
}

export function hashtagsFor(sectionLabel: string) {
  const section = sectionLabel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "");
  const tags = ["#AjoiaBrasil"];
  if (section && section.toLowerCase() !== "ajoiabrasil") tags.push(`#${section}`);
  return tags.join(" ");
}

function headline(title: string, opinion: boolean) {
  const clean = title.replace(/\s+/g, " ").trim();
  if (!opinion || /^opini[aã]o\b/i.test(clean)) return clean;
  return `Opinião: ${clean}`;
}

export function finalizePost(network: SocialNetwork, text: string, url: string) {
  const cleaned = text.replace(/\u0000/g, "").trim();
  const body = cleaned
    .replaceAll(url, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (network === "FACEBOOK") return clip(body, TEXT_LIMIT.FACEBOOK);
  if (network === "X") return fitX(body, url);
  return joinLimited(body, `\n\nLeia a matéria:\n${url}`, TEXT_LIMIT.INSTAGRAM);
}

export function composePost(
  network: SocialNetwork,
  article: {
    title: string;
    dek: string;
    body: string;
    sectionLabel: string;
    opinion: boolean;
    url: string;
  }
) {
  const title = headline(article.title, article.opinion);
  const dek = article.dek.replace(/\s+/g, " ").trim();
  const body = plainText(article.body);
  const summaryMax = network === "X" ? 180 : 480;
  let summary = excerpt(body, summaryMax);
  if (dek && summary.startsWith(dek.slice(0, Math.min(40, dek.length)))) summary = "";

  if (network === "X") {
    const line = dek && chars(dek).length < 160 ? `${title} — ${dek}` : title;
    return finalizePost("X", line, article.url);
  }
  if (network === "FACEBOOK") {
    return finalizePost("FACEBOOK", [title, dek, summary].filter(Boolean).join("\n\n"), article.url);
  }
  return finalizePost(
    "INSTAGRAM",
    [title, dek, summary, hashtagsFor(article.sectionLabel)].filter(Boolean).join("\n\n"),
    article.url
  );
}
