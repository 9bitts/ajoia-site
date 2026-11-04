import Link from "next/link";
import { missao, siteConfig, valores, visao } from "@/data/site";
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
        <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">
          Quem somos
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-mist-muted">
          A {siteConfig.name} ({siteConfig.shortName}) é a Associação Brasileira
          de Jornalistas Independentes e Afiliados — com sede em{" "}
          {siteConfig.city}, reunindo profissionais de doze estados e
          representações no exterior.
        </p>
      </header>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {[
          { title: "Missão", body: missao },
          { title: "Valores", body: valores },
          { title: "Visão", body: visao },
        ].map((item) => (
          <div
            key={item.title}
            className="border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-7"
          >
            <h2 className="font-display text-2xl text-white">{item.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-mist-muted">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-16 max-w-3xl border-t border-white/10 pt-10">
        <h2 className="font-display text-3xl text-white">
          Um posicionamento claro
        </h2>
        <div className="prose-ajoia mt-6">
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
        </div>
      </section>
    </div>
  );
}
