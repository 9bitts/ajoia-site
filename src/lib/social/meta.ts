import { META_SCOPES, graphVersion, metaConfig } from "@/lib/social/config";
import { SocialError } from "@/lib/social/errors";

export type MetaPage = {
  id: string;
  name: string;
  accessToken: string;
  instagram: { id: string; username: string } | null;
};

type GraphError = { error?: { message?: string } };

function safeGraph(message: string | undefined) {
  const text = (message || "A Meta recusou o pedido.")
    .replace(/access_token[=: ]\S+/gi, "access_token")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 280);
}

async function readJson(res: Response) {
  return (await res.json().catch(() => ({}))) as GraphError & Record<string, unknown>;
}

async function graphGet<T>(path: string, token: string, params?: Record<string, string>) {
  const url = new URL(`https://graph.facebook.com/${graphVersion()}/${path.replace(/^\//, "")}`);
  for (const [key, value] of Object.entries(params || {})) url.searchParams.set(key, value);
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new SocialError("A Meta demorou para responder. Tente de novo.");
  }
  const json = await readJson(res);
  if (!res.ok || json.error) throw new SocialError(`Meta: ${safeGraph(json.error?.message)}`);
  return json as T;
}

async function graphPost<T>(path: string, token: string, params: Record<string, string>) {
  let res: Response;
  try {
    res = await fetch(`https://graph.facebook.com/${graphVersion()}/${path.replace(/^\//, "")}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new SocialError("A Meta demorou para responder. Tente de novo.");
  }
  const json = await readJson(res);
  if (!res.ok || json.error) throw new SocialError(`Meta: ${safeGraph(json.error?.message)}`);
  return json as T;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function metaAuthorizeUrl(input: { redirectUri: string; nonce: string }) {
  const cfg = metaConfig();
  if (!cfg) throw new SocialError("Falta META_APP_ID e META_APP_SECRET no servidor.");
  const params = new URLSearchParams({
    client_id: cfg.appId,
    redirect_uri: input.redirectUri,
    state: input.nonce,
    response_type: "code",
  });
  if (cfg.configId) {
    params.set("config_id", cfg.configId);
    params.set("override_default_response_type", "true");
  } else {
    params.set("scope", META_SCOPES);
  }
  // A versão no caminho (/v25.0/dialog/oauth) faz a Meta dizer que o ID do app é inválido.
  return `https://www.facebook.com/dialog/oauth?${params}`;
}

async function accessToken(params: Record<string, string>) {
  let res: Response;
  try {
    res = await fetch(`https://graph.facebook.com/${graphVersion()}/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new SocialError("A Meta demorou para responder. Tente de novo.");
  }
  const json = await readJson(res);
  const token = json.access_token;
  if (!res.ok || typeof token !== "string" || !token) {
    throw new SocialError(`Meta: ${safeGraph(json.error?.message)}`);
  }
  return token;
}

function instagramOf(value: { id?: string; username?: string } | undefined) {
  if (!value?.id) return null;
  return { id: value.id, username: value.username || value.id };
}

export async function fetchMetaPages(code: string, redirectUri: string) {
  const cfg = metaConfig();
  if (!cfg) throw new SocialError("Falta META_APP_ID e META_APP_SECRET no servidor.");
  const short = await accessToken({
    client_id: cfg.appId,
    client_secret: cfg.appSecret,
    redirect_uri: redirectUri,
    code,
  });
  const userToken = await accessToken({
    grant_type: "fb_exchange_token",
    client_id: cfg.appId,
    client_secret: cfg.appSecret,
    fb_exchange_token: short,
  });
  const listed = await graphGet<{
    data?: {
      id: string;
      name?: string;
      access_token?: string;
      instagram_business_account?: { id: string; username?: string };
    }[];
  }>("me/accounts", userToken, {
    fields: "id,name,access_token,instagram_business_account{id,username}",
    limit: "50",
  });

  const pages: MetaPage[] = [];
  for (const page of listed.data || []) {
    if (!page.id || !page.access_token) continue;
    let instagram = instagramOf(page.instagram_business_account);
    if (!instagram) {
      try {
        const extra = await graphGet<{
          instagram_business_account?: { id: string; username?: string };
        }>(page.id, page.access_token, {
          fields: "instagram_business_account{id,username}",
        });
        instagram = instagramOf(extra.instagram_business_account);
      } catch {
        instagram = null;
      }
    }
    pages.push({
      id: page.id,
      name: page.name || "Página",
      accessToken: page.access_token,
      instagram,
    });
  }
  return pages;
}

export async function postToFacebook(pageId: string, token: string, message: string, link: string) {
  let json: { id?: string };
  try {
    json = await graphPost<{ id?: string }>(`${pageId}/feed`, token, { message, link });
  } catch (error) {
    if (!(error instanceof SocialError) || !/link/i.test(error.message)) throw error;
    json = await graphPost<{ id?: string }>(`${pageId}/feed`, token, {
      message: `${message}\n\n${link}`,
    });
  }
  if (!json.id) throw new SocialError("A Meta não confirmou o post.");
  const mark = json.id.indexOf("_");
  const page = mark === -1 ? pageId : json.id.slice(0, mark);
  const post = mark === -1 ? json.id : json.id.slice(mark + 1);
  return { id: json.id, url: `https://www.facebook.com/${page}/posts/${post}` };
}

export async function postToInstagram(igId: string, token: string, imageUrl: string, caption: string) {
  const created = await graphPost<{ id?: string }>(`${igId}/media`, token, {
    image_url: imageUrl,
    caption,
  });
  if (!created.id) throw new SocialError("O Instagram não abriu a publicação.");

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const status = await graphGet<{ status_code?: string }>(created.id, token, {
      fields: "status_code",
    });
    if (!status.status_code || status.status_code === "FINISHED") break;
    if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
      throw new SocialError("O Instagram não aceitou a foto. Use a capa em JPG, com a matéria no ar.");
    }
    await sleep(2000);
  }

  const published = await graphPost<{ id?: string }>(`${igId}/media_publish`, token, {
    creation_id: created.id,
  });
  if (!published.id) throw new SocialError("O Instagram não confirmou a publicação.");

  try {
    const media = await graphGet<{ permalink?: string }>(published.id, token, {
      fields: "permalink",
    });
    return { id: published.id, url: media.permalink || null };
  } catch {
    return { id: published.id, url: null };
  }
}
