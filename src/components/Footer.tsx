import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { institutionalLinks, navSections, siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="on-dark border-t border-[#e8c56b]/30 bg-[#111113] text-white">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <BrandLogo href="/" size="lg" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Compromisso com os fatos, ética profissional e liberdade de
            expressão.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[#e8c56b]">
            Sede · {siteConfig.city}
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
            Seções
          </p>
          <ul className="mt-4 space-y-2">
            {navSections.map((section) => (
              <li key={section.slug}>
                <Link
                  href={`/secao/${section.slug}`}
                  className="text-sm text-white/75 transition-colors hover:text-[#e8c56b]"
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
            Institucional
          </p>
          <ul className="mt-4 space-y-2">
            {institutionalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/75 transition-colors hover:text-[#e8c56b]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/colunistas"
                className="text-sm text-white/75 transition-colors hover:text-[#e8c56b]"
              >
                Colunistas
              </Link>
            </li>
            <li>
              <Link
                href="/assine"
                className="text-sm font-semibold text-[#e8c56b]"
              >
                Assine
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-content flex-col gap-3 px-5 py-6 text-xs text-white/45 md:flex-row md:items-center md:justify-between">
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
