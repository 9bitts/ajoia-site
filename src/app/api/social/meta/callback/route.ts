import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import { putHandoff, saveMetaPage } from "@/lib/social/accounts";
import { adminSession } from "@/lib/social/guard";
import {
  OAUTH_COOKIE,
  PAGES_COOKIE,
  cookieBase,
  readOAuthState,
  requestOrigin,
} from "@/lib/social/http";
import { fetchMetaPages } from "@/lib/social/meta";
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
    "meta"
  );
  const origin = state?.origin || requestOrigin(req);
  const oauthError = current.searchParams.get("error");
  if (oauthError) {
    const description = current.searchParams.get("error_description") || "";
    const code =
      oauthError === "access_denied"
        ? "meta_denied"
        : /scope/i.test(description)
          ? "meta_scope"
          : "meta_token";
    return back(origin, { erro: code });
  }
  if (!state) return back(requestOrigin(req), { erro: "meta_state" });

  const session = await adminSession();
  if (!session) {
    const login = new URL("/admin/login", state.origin);
    login.searchParams.set("callbackUrl", "/admin/redes");
    const res = NextResponse.redirect(login);
    res.cookies.set(OAUTH_COOKIE, "", cookieBase(0));
    return res;
  }

  const code = current.searchParams.get("code");
  if (!code) return back(state.origin, { erro: "meta_token" });

  try {
    const pages = await fetchMetaPages(code, state.redirectUri);
    if (pages.length === 0) return back(state.origin, { erro: "meta_pages" });
    if (pages.length === 1) {
      await saveMetaPage(pages[0]);
      await recordAudit({
        action: "social.connect",
        actorId: session.user.id,
        actorEmail: session.user.email,
        targetType: "social",
        targetId: "META",
        detail: pages[0].name.slice(0, 200),
        ip: clientIp(req),
      });
      return back(state.origin, { ok: pages[0].instagram ? "meta_ig" : "meta" });
    }
    const id = await putHandoff(pages);
    const res = back(state.origin, { escolher: "1" });
    res.cookies.set(PAGES_COOKIE, id, cookieBase(600));
    return res;
  } catch (error) {
    const detalhe = safeDetail(error);
    return back(state.origin, detalhe ? { erro: "meta_token", detalhe } : { erro: "meta_token" });
  }
}
