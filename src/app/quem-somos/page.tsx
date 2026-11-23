import Link from "next/link";
import { siteConfig } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Quem Somos",
  description: siteConfig.description,
  path: "/quem-somos",
});

export default function QuemSomosPage() {
  return (
    <div className="mx-auto max-w-content px-5 py-12 md:py-16">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
          Institucional
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">
          Quem somos
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-mist-muted">
          A {siteConfig.name} ({siteConfig.shortName}) é a Associação Brasileira
          de Jornalistas Independentes e Afiliados — com sede em{" "}
          {siteConfig.city}, reunindo profissionais de doze estados e
          representações no exterior.
        </p>
      </header>

      <section className="mt-14 border-t border-[var(--line)] pt-10">
        <h2 className="font-display text-3xl text-[var(--text)]">
          Um posicionamento claro
        </h2>
        <div className="prose-ajoia mt-6 max-w-none">
          <p>
            Mais do que uma entidade representativa, a Ajoia Brasil surge como
            posicionamento: um contraponto à superficialidade, à contaminação
            ideológica e à perda de rigor que fragilizam a prática jornalística
            contemporânea.
          </p>
          <p>
            Inspirada pelo legado de nomes como José Roberto Guzzo, a associação
            defende a deontologia do jornalismo com responsabilidade,
            independência e rigor técnico. Em tempos de ruído informacional,
            aposta na clareza.
          </p>
          <p>
            Presidência: {siteConfig.president}. Fundada em {siteConfig.founded}
            , com lançamento oficial em março de 2026 em Belo Horizonte.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/diretrizes" className="btn-primary text-xs uppercase tracking-[0.14em]">
            Ler diretrizes
          </Link>
          <Link href="/colunistas" className="btn-ghost">
            Conhecer colunistas →
          </Link>
          <Link href="/artigo/fundadores" className="btn-ghost">
            Fundadores
          </Link>
          <Link href="/artigo/diretoria-executiva" className="btn-ghost">
            Diretoria
          </Link>
          <Link href="/artigo/conselhos" className="btn-ghost">
            Conselhos
          </Link>
        </div>
      </section>
    </div>
  );
}
