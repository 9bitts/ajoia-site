"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { headerAds } from "@/data/ads";
import { institutionalLinks, navSections, siteConfig } from "@/data/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto flex max-w-content items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5">
          <BrandLogo href="/" size="md" priority className="max-w-[46vw] shrink-0 sm:max-w-none" />

          {headerAds[0] && (
            <div className="hidden min-w-0 flex-1 lg:block">
              <AdSlot ad={headerAds[0]} variant="leaderboard" />
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
            <p className="hidden text-[11px] uppercase tracking-[0.14em] text-mist-dim xl:block">
              {siteConfig.city}
              {today ? ` · ${today}` : ""}
            </p>
            <ThemeToggle
              compact
              className="hidden text-[10px] tracking-[0.14em] text-mist-dim md:inline"
            />
            <Link
              href="/assine"
              className="border border-[#c6a35a] bg-[#111113] px-3 py-2 text-[11px] font-bold tracking-[0.16em] text-[#e8c56b] sm:px-4"
            >
              ASSINE
            </Link>
            <button
              type="button"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className="flex h-10 w-10 items-center justify-center border border-[var(--line)] lg:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <div className="flex w-4 flex-col gap-1.5">
                <span
                  className={`h-px w-full bg-[var(--text)] transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
                />
                <span
                  className={`h-px w-full bg-[var(--text)] transition ${open ? "opacity-0" : ""}`}
                />
                <span
                  className={`h-px w-full bg-[var(--text)] transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>
        {headerAds[0] && (
          <div className="mx-auto max-w-content px-4 pb-3 lg:hidden">
            <AdSlot ad={headerAds[0]} variant="leaderboard" />
          </div>
        )}
      </div>

      <nav className="mast-nav on-dark hidden bg-[#111113] lg:block">
        <div className="mx-auto flex max-w-content items-center gap-6 overflow-x-auto px-5 py-3.5">
          <Link
            href="/"
            data-active={pathname === "/"}
            className="nav-link whitespace-nowrap text-[13px] font-semibold text-white/80 hover:text-white"
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
                className="nav-link whitespace-nowrap text-[13px] font-semibold text-white/80 hover:text-white"
              >
                {section.label}
              </Link>
            );
          })}
          <Link
            href="/colunistas"
            data-active={pathname.startsWith("/colunistas")}
            className="nav-link whitespace-nowrap text-[13px] font-semibold text-white/80 hover:text-white"
          >
            Colunistas
          </Link>
          <Link
            href="/ultimas"
            data-active={pathname.startsWith("/ultimas")}
            className="nav-link whitespace-nowrap text-[13px] font-semibold text-white/80 hover:text-white"
          >
            Últimas
          </Link>
        </div>
      </nav>

      {open && (
        <div className="max-h-[min(80vh,640px)] overflow-y-auto border-t border-[var(--line)] bg-[var(--bg)] px-4 py-5 lg:hidden">
          <div className="grid gap-1">
            <Link href="/" className="py-3 text-sm font-semibold">
              Capa
            </Link>
            {navSections.map((section) => (
              <Link
                key={section.slug}
                href={`/secao/${section.slug}`}
                className="border-t border-[var(--line)] py-3 text-sm font-semibold"
              >
                {section.label}
              </Link>
            ))}
            <Link
              href="/colunistas"
              className="border-t border-[var(--line)] py-3 text-sm font-semibold"
            >
              Colunistas
            </Link>
            <Link
              href="/ultimas"
              className="border-t border-[var(--line)] py-3 text-sm font-semibold"
            >
              Últimas
            </Link>
            {institutionalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-t border-[var(--line)] py-3 text-sm text-mist-muted"
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle className="justify-self-start border-t border-[var(--line)] py-3 text-xs text-mist-muted" />
          </div>
        </div>
      )}
    </header>
  );
}
