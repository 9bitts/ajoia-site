import { randomBytes, timingSafeEqual } from "crypto";
import { siteUrl } from "@/lib/site-url";
import { openSeal, sealSecret } from "@/lib/social/crypto";

export const OAUTH_COOKIE = "ajoia_oauth";
export const PAGES_COOKIE = "ajoia_pages";
export const META_CALLBACK_PATH = "/api/social/meta/callback";
export const X_CALLBACK_PATH = "/api/social/x/callback";

export type OAuthState = {
  nonce: string;
  purpose: "meta" | "x";
  exp: number;
  redirectUri: string;
  origin: string;
  verifier?: string;
};

export function cookieBase(maxAge: number) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function requestOrigin(req: Request) {
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "")
    .split(",")[0]
    .trim();
  const forwarded = (req.headers.get("x-forwarded-proto") || "").split(",")[0].trim();
  if (!host || !/^[a-z0-9.-]+(?::\d+)?$/i.test(host)) return siteUrl();
  const local = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const proto = local ? "http" : forwarded === "http" ? "http" : "https";
  return `${proto}://${host}`;
}

export function newNonce() {
  return randomBytes(16).toString("base64url");
}

export function writeOAuthState(state: OAuthState) {
  return sealSecret(JSON.stringify(state));
}

function same(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function readOAuthState(
  raw: string | undefined,
  nonce: string,
  purpose: OAuthState["purpose"]
) {
  if (!raw || !nonce) return null;
  try {
    const state = JSON.parse(openSeal(raw)) as OAuthState;
    if (state.purpose !== purpose || state.exp < Date.now()) return null;
    if (!same(state.nonce, nonce)) return null;
    if (!state.origin.startsWith("http") || !state.redirectUri.startsWith(`${state.origin}/`)) {
      return null;
    }
    return state;
  } catch {
    return null;
  }
}
