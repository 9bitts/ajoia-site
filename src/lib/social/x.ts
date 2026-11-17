import { createHash, randomBytes } from "crypto";
import { xConfig } from "@/lib/social/config";
import { SocialError, TokenExpired } from "@/lib/social/errors";

type XToken = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

export function createPkce() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function xAuthorizeUrl(input: {
  redirectUri: string;
  nonce: string;
  challenge: string;
}) {
  const cfg = xConfig();
  if (!cfg) throw new SocialError("Falta X_CLIENT_ID e X_CLIENT_SECRET no servidor.");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: cfg.clientId,
    redirect_uri: input.redirectUri,
    scope: "tweet.read tweet.write users.read offline.access",
    state: input.nonce,
    code_challenge: input.challenge,
    code_challenge_method: "S256",
  });
  return `https://x.com/i/oauth2/authorize?${params}`;
}

function xFailure(status: number, json: { detail?: string; title?: string; errors?: { message?: string }[] }) {
  const detail = json.detail || json.errors?.[0]?.message || json.title || "";
  if (status === 402 || /credit|payment|spend|billing|funding/i.test(detail)) {
    return "O X não publicou. Compre créditos na conta de desenvolvedor. Post com link é cobrado à parte.";
  }
  if (detail) return `X: ${detail.replace(/\s+/g, " ").slice(0, 240)}`;
  return "O X recusou a publicação.";
}

async function tokenRequest(params: Record<string, string>) {
  const cfg = xConfig();
  if (!cfg) throw new SocialError("Falta X_CLIENT_ID e X_CLIENT_SECRET no servidor.");
  const basic = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString("base64");
  let res: Response;
  try {
    res = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ ...params, client_id: cfg.clientId }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new SocialError("O X demorou para responder. Tente de novo.");
  }
  const json = (await res.json().catch(() => ({}))) as XToken & { error_description?: string };
  if (!res.ok || !json.access_token) {
    throw new SocialError(
      json.error_description
        ? `X: ${json.error_description.replace(/\s+/g, " ").slice(0, 240)}`
        : "O X não entregou o acesso."
    );
  }
  return json;
}

export function exchangeXCode(code: string, redirectUri: string, verifier: string) {
  return tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });
}

export function refreshX(refreshToken: string) {
  return tokenRequest({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

export async function xProfile(token: string) {
  let res: Response;
  try {
    res = await fetch("https://api.x.com/2/users/me", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new SocialError("O X demorou para responder. Tente de novo.");
  }
  const json = (await res.json().catch(() => ({}))) as {
    data?: { id?: string; username?: string; name?: string };
    detail?: string;
  };
  if (!res.ok || !json.data?.id || !json.data.username) {
    throw new SocialError(json.detail ? `X: ${json.detail.slice(0, 200)}` : "O X não informou a conta.");
  }
  return { id: json.data.id, username: json.data.username };
}

export async function createXPost(token: string, text: string, username: string) {
  let res: Response;
  try {
    res = await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new SocialError("O X demorou para responder. Tente de novo.");
  }
  const json = (await res.json().catch(() => ({}))) as {
    data?: { id?: string };
    detail?: string;
    title?: string;
    errors?: { message?: string }[];
  };
  if (res.status === 401) throw new TokenExpired("A sessão do X expirou. Conecte de novo em Redes.");
  if (!res.ok || !json.data?.id) throw new SocialError(xFailure(res.status, json));
  const handle = username.replace(/^@/, "");
  return { id: json.data.id, url: `https://x.com/${handle}/status/${json.data.id}` };
}
