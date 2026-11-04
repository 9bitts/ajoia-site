import { siteUrl } from "@/lib/site-url";

export async function pingIndexNow(urls: string[]) {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key || urls.length === 0) return;

  const endpoint = siteUrl();
  let host = "";
  try {
    host = new URL(endpoint).host;
  } catch {
    return;
  }

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${endpoint}/indexnow-key.txt`,
        urlList: urls.slice(0, 100),
      }),
    });
  } catch {
    // Aviso ao Bing não pode impedir a publicação.
  }
}
