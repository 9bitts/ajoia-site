import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import { saveXAccount } from "@/lib/social/accounts";
import { adminSession } from "@/lib/social/guard";
import { OAUTH_COOKIE, cookieBase, readOAuthState, requestOrigin } from "@/lib/social/http";
import { exchangeXCode, xProfile } from "@/lib/social/x";
import { safeDetail } from "@/lib/social/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function back(origin: string, query: Record<string, string>) {
  const url = new URL("/admin/redes", origin);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  const res = NextResponse.redirect(url);
  res.cookies.set(OAUTH_COOKIE, "", cookieBase(0));
  return res;
}

export async function GET(req: Request) {
  const current = new URL(req.url);
  const jar = await cookies();
  const state = readOAuthState(
    jar.get(OAUTH_COOKIE)?.value,
    current.searchParams.get("state") || "",
    "x"
  );
  const origin = state?.origin || requestOrigin(req);
  if (current.searchParams.get("error")) {
    const denied = current.searchParams.get("error") === "access_denied";
    return back(origin, { erro: denied ? "x_denied" : "x_token" });
  }
  if (!state?.verifier) return back(requestOrigin(req), { erro: "x_state" });

  const session = await adminSession();
  if (!session) {
    const login = new URL("/admin/login", state.origin);
    login.searchParams.set("callbackUrl", "/admin/redes");
    const res = NextResponse.redirect(login);
    res.cookies.set(OAUTH_COOKIE, "", cookieBase(0));
    return res;
  }

  const code = current.searchParams.get("code");
  if (!code) return back(state.origin, { erro: "x_token" });

  try {
    const token = await exchangeXCode(code, state.redirectUri, state.verifier);
    const profile = await xProfile(token.access_token);
    await saveXAccount({
      accountId: profile.id,
      accountName: profile.username,
      accessToken: token.access_token,
      refreshToken: token.refresh_token || null,
      expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : null,
    });
    await recordAudit({
      action: "social.connect",
      actorId: session.user.id,
      actorEmail: session.user.email,
      targetType: "social",
      targetId: "X",
      detail: `@${profile.username}`.slice(0, 200),
      ip: clientIp(req),
    });
    return back(state.origin, { ok: "x" });
  } catch (error) {
    const detalhe = safeDetail(error);
    return back(state.origin, detalhe ? { erro: "x_token", detalhe } : { erro: "x_token" });
  }
}
