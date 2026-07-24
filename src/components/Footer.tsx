import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import {
  institutionalLinks,
  navSections,
  siteConfig,
} from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-gradient-to-b from-ink-elevated to-ink">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <BrandLogo href="/" size="lg" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mist-muted">
            Compromisso com os fatos, ética profissional e liberdade de
            expressão.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-mist-dim">
            Sede · {siteConfig.city}
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-mist-dim">
            Seções
          </p>
          <ul className="mt-4 space-y-2">
            {navSections.map((section) => (
              <li key={section.slug}>
                <Link
                  href={`/secao/${section.slug}`}
                  className="text-sm text-mist-muted transition-colors hover:text-white"
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-mist-dim">
            Institucional
          </p>
          <ul className="mt-4 space-y-2">
            {institutionalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-mist-muted transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/colunistas"
                className="text-sm text-mist-muted transition-colors hover:text-white"
              >
                Colunistas
              </Link>
            </li>
            <li>
              <Link
                href="/assine"
                className="text-sm text-gold transition-colors hover:text-white"
              >
                Assine
              </Link>
            </li>
            <li>
              <Link
                href="/admin"
                className="text-sm text-mist-muted transition-colors hover:text-white"
              >
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-content flex-col gap-3 px-5 py-6 text-xs text-mist-dim md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos
            reservados.
          </p>
          <p className="max-w-xl leading-relaxed">
            Artigos e opiniões são de inteira responsabilidade dos colunistas. O
            portal não se responsabiliza por ideias ou posicionamentos expressos
            nos textos.
          </p>
        </div>
      </div>
    </footer>
  );
}
