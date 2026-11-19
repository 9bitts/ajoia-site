import { siteUrl } from "@/lib/site-url";

/** Chave pública. O site a publica em /indexnow-key.txt. INDEXNOW_KEY troca esta. */
export const DEFAULT_INDEXNOW_KEY = "b7e4c91a6d2f48e0a5c3b81d09f6e274";

export function indexNowKey() {
  return process.env.INDEXNOW_KEY?.trim() || DEFAULT_INDEXNOW_KEY;
}

export async function pingIndexNow(urls: string[]) {
  const key = indexNowKey();
  if (!key || urls.length === 0) return;

  const endpoint = siteUrl();
  let host = "";
  try {
    host = new URL(endpoint).host;
  } catch {
    return;
  }

  const body = JSON.stringify({
    host,
    key,
    keyLocation: `${endpoint}/indexnow-key.txt`,
    urlList: urls.slice(0, 100),
  });
  await Promise.all(
    ["https://api.indexnow.org/indexnow", "https://www.bing.com/indexnow"].map(
      (target) =>
        fetch(target, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body,
        }).catch(() => undefined)
    )
  );
}
