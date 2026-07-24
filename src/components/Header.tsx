"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import {
  institutionalLinks,
  navSections,
  siteConfig,
} from "@/data/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-mist-dim">
        <div className="hidden items-center gap-5 md:flex">
          {institutionalLinks.slice(0, 4).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-mist"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="truncate text-[10px] tracking-[0.22em] text-mist-soft md:text-right">
          {siteConfig.city} · Jornalismo independente
        </p>
      </div>

      <div className="hairline" />

      <div className="mx-auto flex max-w-content items-center justify-between gap-6 px-5 py-4">
        <BrandLogo href="/" size="md" priority />

        <div className="flex items-center gap-3">
          <Link
            href="/ultimas"
            className="hidden text-xs uppercase tracking-[0.16em] text-mist-soft transition-colors hover:text-white md:inline"
          >
            Últimas
          </Link>
          <Link href="/colunistas" className="btn-primary text-xs uppercase tracking-[0.14em]">
            Colunistas
          </Link>
          <Link href="/assine" className="btn-gold text-[11px] tracking-[0.16em] md:hidden">
            Assine
          </Link>
          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="flex h-10 w-10 items-center justify-center border border-white/15 text-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <div className="flex w-4 flex-col gap-1.5">
              <span
                className={`h-px w-full bg-white transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
              />
              <span className={`h-px w-full bg-white transition ${open ? "opacity-0" : ""}`} />
              <span
                className={`h-px w-full bg-white transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-white/[0.06] lg:block">
        <div className="mx-auto flex max-w-content items-center gap-7 overflow-x-auto px-5 py-3">
          <Link
            href="/"
            data-active={pathname === "/"}
            className="nav-link whitespace-nowrap text-[12px] uppercase tracking-[0.18em] text-mist-muted hover:text-white"
          >
            Capa
          </Link>
          {navSections.map((section) => {
            const href = `/secao/${section.slug}`;
            return (
              <Link
                key={section.slug}
                href={href}
                data-active={pathname.startsWith(href)}
                className="nav-link whitespace-nowrap text-[12px] uppercase tracking-[0.18em] text-mist-muted hover:text-white"
              >
                {section.label}
              </Link>
            );
          })}
          <Link
            href="/colunistas"
            data-active={pathname.startsWith("/colunistas")}
            className="nav-link whitespace-nowrap text-[12px] uppercase tracking-[0.18em] text-mist-muted hover:text-white"
          >
            Colunistas
          </Link>
          <Link
            href="/assine"
            className="btn-gold ml-2 shrink-0 !py-2 !px-4 text-[11px] tracking-[0.16em]"
          >
            Assine
          </Link>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink/95 px-5 py-6 backdrop-blur-xl lg:hidden">
          <div className="grid gap-4">
            {navSections.map((section) => (
              <Link
                key={section.slug}
                href={`/secao/${section.slug}`}
                className="border-b border-white/5 pb-3 text-sm uppercase tracking-[0.16em] text-mist"
              >
                {section.label}
              </Link>
            ))}
            <Link
              href="/colunistas"
              className="border-b border-white/5 pb-3 text-sm uppercase tracking-[0.16em] text-mist"
            >
              Colunistas
            </Link>
            <Link
              href="/assine"
              className="btn-gold w-fit text-[11px] tracking-[0.16em]"
            >
              Assine
            </Link>
            <Link
              href="/ultimas"
              className="border-b border-white/5 pb-3 text-sm uppercase tracking-[0.16em] text-mist"
            >
              Últimas
            </Link>
            {institutionalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-[0.16em] text-mist-dim"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
