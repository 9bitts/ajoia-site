"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { headerAds } from "@/data/ads";
import { institutionalLinks, navSections, sectionHref, siteConfig } from "@/data/site";

export function Header() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
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

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    const measure = () => {
      setMenuTop(barRef.current?.getBoundingClientRect().bottom ?? 0);
    };
    measure();
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      window.scrollTo(0, scrollY);
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [open]);

  function toggleMenu() {
    if (!open) {
      setMenuTop(barRef.current?.getBoundingClientRect().bottom ?? 0);
    }
    setOpen((value) => !value);
  }

  return (
    <header className="sticky top-0 z-50">
      <div
        ref={barRef}
        className="border-b border-[var(--line)] bg-[var(--bg)] pt-[env(safe-area-inset-top)]"
      >
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
              className="inline-flex h-11 items-center border border-[#c6a35a] bg-[#111113] px-3 text-[11px] font-bold tracking-[0.16em] text-[#e8c56b] sm:px-4"
            >
              ASSINE
            </Link>
            <button
              type="button"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              className="flex h-11 w-11 items-center justify-center border border-[var(--line)] lg:hidden"
              onClick={toggleMenu}
            >
              <span className="sr-only">Menu</span>
              <div className="flex w-4 flex-col gap-1.5">
                <span
                  className={`h-px w-full bg-[var(--text)] transition ${open ? "translate-y-[7px] rotate-45" : ""}`}
                />
                <span
                  className={`h-px w-full bg-[var(--text)] transition ${open ? "opacity-0" : ""}`}
                />
                <span
                  className={`h-px w-full bg-[var(--text)] transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
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
            const href = sectionHref(section.slug);
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
        </div>
      </nav>

      {open && (
        <div
          className="fixed inset-x-0 bottom-0 z-[60] overflow-y-auto overscroll-contain border-t border-[var(--line)] bg-[var(--bg)] px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
          style={{ top: menuTop }}
        >
          <div className="grid">
            <Link href="/" className="flex min-h-11 items-center text-sm font-semibold">
              Capa
            </Link>
            {navSections.map((section) => (
              <Link
                key={section.slug}
                href={sectionHref(section.slug)}
                className="flex min-h-11 items-center border-t border-[var(--line)] text-sm font-semibold"
              >
                {section.label}
              </Link>
            ))}
            {institutionalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center border-t border-[var(--line)] text-sm text-mist-muted"
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle className="flex min-h-11 w-full items-center border-t border-[var(--line)] text-left text-xs text-mist-muted" />
          </div>
        </div>
      )}
    </header>
  );
}
