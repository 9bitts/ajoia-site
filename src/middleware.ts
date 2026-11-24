import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const sections = new Set([
  "politica",
  "editorial",
  "nacional",
  "internacional",
  "cultura",
  "saude",
  "colunistas",
  "tema-livre",
  "ultimas",
  "opiniao",
  "economia",
  "estado",
  "cidade",
  "mundo",
]);

/** Páginas do WordPress que mudaram de caminho no portal novo. */
const legacyPaths: Record<string, string> = {
  "/midia-kit-publicidade": "/midia-kit",
  "/politica-de-privacidade": "/privacidade",
  "/termos-de-uso": "/artigo/termos-de-uso",
  "/diretoria-executiva": "/artigo/diretoria-executiva",
  "/conselhos": "/artigo/conselhos",
  "/fundadores": "/artigo/fundadores",
  "/redacao": "/expediente",
  "/1a-conferencia-ajoia-brasil-sao-paulo-2026":
    "/artigo/1a-conferencia-ajoia-brasil-sao-paulo-2026",
};

function barePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function requestHostname(req: { headers: Headers }) {
  const raw = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  return raw.split(",")[0].trim().split(":")[0].toLowerCase();
}

function contentSecurityPolicy(nonce: string) {
  const analytics = [
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
  ].join(" ");
  const turnstile = "https://challenges.cloudflare.com";
  const upgrade =
    process.env.NODE_ENV === "production" ? "; upgrade-insecure-requests" : "";
  const devEval = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${devEval} ${analytics} ${turnstile}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src 'self' ${analytics} ${turnstile}`,
    `frame-src https://www.youtube.com https://www.youtube-nocookie.com ${turnstile}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ") + upgrade;
}

function withSecurity(response: NextResponse, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains"
    );
  }
  return response;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce);

  const path = barePath(pathname);
  const slash = pathname.length > 1 && pathname.endsWith("/");
  let target: string | null = null;

  const dated = path.match(/^\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)$/);
  if (dated) target = `/artigo/${dated[4]}`;
  else if (legacyPaths[path]) target = legacyPaths[path];
  else if (path === "/feed") target = "/feed.xml";
  else if (path.startsWith("/author/")) {
    const slug = path.split("/")[2] || "";
    target = slug ? `/colunistas/${slug}` : "/colunistas";
  } else if (path.startsWith("/categorias/") || path.startsWith("/category/")) {
    const slug = path.split("/")[2] || "";
    target = sections.has(slug) ? `/secao/${slug}` : "/colunistas";
  } else if (slash) target = path;

  const www = requestHostname(req) === "www.ajoiabrasil.com.br";
  if (www || target) {
    const dest = new URL(
      `${target || path}${req.nextUrl.search}`,
      www ? "https://ajoiabrasil.com.br" : req.nextUrl.origin
    );
    return withSecurity(NextResponse.redirect(dest, 308), csp);
  }

  const publicAdmin =
    pathname.startsWith("/admin/login") || pathname.startsWith("/admin/cadastro");
  if (pathname.startsWith("/admin") && !publicAdmin && !req.auth?.user) {
    const url = new URL("/admin/login", req.nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return withSecurity(NextResponse.redirect(url), csp);
  }
  if (
    pathname.startsWith("/admin") &&
    req.auth?.user?.mustChangePassword &&
    pathname !== "/admin/senha"
  ) {
    return withSecurity(NextResponse.redirect(new URL("/admin/senha", req.nextUrl)), csp);
  }

  if (req.auth?.user?.role === "LIVREIRO") {
    const livreiroPath = barePath(pathname);
    if (livreiroPath.startsWith("/api/")) {
      const allowedApi =
        livreiroPath.startsWith("/api/livraria") ||
        livreiroPath.startsWith("/api/upload") ||
        livreiroPath.startsWith("/api/auth") ||
        livreiroPath === "/api/account/password" ||
        livreiroPath === "/api/me";
      if (!allowedApi) {
        return withSecurity(
          NextResponse.json({ error: "Sem permissão" }, { status: 403 }),
          csp,
        );
      }
    }
    if (livreiroPath.startsWith("/admin")) {
      const allowedPage =
        livreiroPath.startsWith("/admin/livraria") ||
        livreiroPath === "/admin/senha" ||
        livreiroPath.startsWith("/admin/login") ||
        livreiroPath.startsWith("/admin/cadastro");
      if (!allowedPage) {
        return withSecurity(
          NextResponse.redirect(new URL("/admin/livraria", req.nextUrl)),
          csp,
        );
      }
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("Content-Security-Policy", csp);

  return withSecurity(NextResponse.next({ request: { headers: requestHeaders } }), csp);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|img$|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)",
  ],
};
