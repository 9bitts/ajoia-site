import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { metaAuthorizeUrl } from "@/lib/social/meta";
import {
  META_CALLBACK_PATH,
  OAUTH_COOKIE,
  cookieBase,
  newNonce,
  requestOrigin,
  writeOAuthState,
} from "@/lib/social/http";
import { publicError } from "@/lib/social/errors";
import { requireAdmin } from "@/lib/social/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;
  if (await isRateLimited(`social-oauth:${gate.session.user.id}`, 15, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente de novo mais tarde." }, { status: 429 });
  }

  try {
    const origin = requestOrigin(req);
    const redirectUri = `${origin}${META_CALLBACK_PATH}`;
    const nonce = newNonce();
    const url = metaAuthorizeUrl({ redirectUri, nonce });
    const res = NextResponse.json({ url });
    res.cookies.set(
      OAUTH_COOKIE,
      writeOAuthState({
        nonce,
        purpose: "meta",
        exp: Date.now() + 10 * 60 * 1000,
        redirectUri,
        origin,
      }),
      cookieBase(600)
    );
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: publicError(error, "Não foi possível abrir a Meta.") },
      { status: 400 }
    );
  }
}
