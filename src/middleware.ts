import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const sections = new Set([
  "politica",
  "estado",
  "cidade",
  "mundo",
  "cultura",
  "opiniao",
  "editorial",
  "tema-livre",
]);

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

  const dated = pathname.match(/^\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/?$/);
  if (dated) {
    const url = req.nextUrl.clone();
    url.pathname = `/artigo/${dated[4]}`;
    return withSecurity(NextResponse.redirect(url, 308), csp);
  }

  if (pathname.startsWith("/categorias/")) {
    const slug = pathname.split("/")[2] || "";
    const url = req.nextUrl.clone();
    if (sections.has(slug)) url.pathname = `/secao/${slug}`;
    else if (slug === "ultimas") url.pathname = "/ultimas";
    else url.pathname = "/colunistas";
    return withSecurity(NextResponse.redirect(url, 308), csp);
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

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("Content-Security-Policy", csp);

  return withSecurity(NextResponse.next({ request: { headers: requestHeaders } }), csp);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)",
  ],
};
