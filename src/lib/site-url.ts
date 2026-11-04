import { siteConfig } from "@/data/site";

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalized}`;
}

/** Perfis reais. Endereços genéricos (facebook.com/) não entram no schema. */
export function organizationSameAs() {
  return Object.values(siteConfig.social).filter((value) => {
    try {
      const url = new URL(value);
      return url.pathname !== "/" && url.pathname !== "";
    } catch {
      return false;
    }
  });
}
