import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasSessionCookie(req: NextRequest) {
  return Boolean(
    req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("__Secure-authjs.session-token")?.value ||
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const dated = pathname.match(/^\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/?$/);
  if (dated) {
    const url = req.nextUrl.clone();
    url.pathname = `/artigo/${dated[4]}`;
    return NextResponse.redirect(url, 308);
  }

  if (pathname.startsWith("/categorias/")) {
    const slug = pathname.split("/")[2] || "";
    const url = req.nextUrl.clone();
    if (sections.has(slug)) url.pathname = `/secao/${slug}`;
    else if (slug === "ultimas") url.pathname = "/ultimas";
    else url.pathname = "/colunistas";
    return NextResponse.redirect(url, 308);
  }

  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/cadastro")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !hasSessionCookie(req)) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/categorias/:path*",
    "/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug",
  ],
};
