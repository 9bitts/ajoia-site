import Link from "next/link";
import { siteConfig } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Expediente",
  description: "Expediente editorial e institucional da Ajoia Brasil.",
  path: "/expediente",
});

export default function ExpedientePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
        Institucional
      </p>
      <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">
        Expediente
      </h1>

      <dl className="mt-12 space-y-8">
        {[
          { label: "Veículo", value: siteConfig.name },
          { label: "Natureza", value: siteConfig.tagline },
          { label: "Sede", value: siteConfig.city },
          { label: "Presidência", value: siteConfig.president },
          { label: "Fundação", value: siteConfig.founded },
          { label: "Contato", value: siteConfig.email },
        ].map((row) => (
          <div key={row.label} className="border-b border-white/10 pb-6">
            <dt className="text-[11px] uppercase tracking-[0.2em] text-mist-dim">
              {row.label}
            </dt>
            <dd className="mt-2 font-display text-2xl text-white">{row.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-14">
        <h2 className="font-display text-3xl text-white">Redação</h2>
        <dl className="mt-8 space-y-6">
          {[
            ["Presidente", "José Aparecido Ribeiro"],
            ["Editor-chefe", "Luís Otávio de Vasconcelos Pires"],
            ["Editor-assistente", "Vago"],
            ["Minas Gerais", "Alexandre Siqueira, José Aparecido Ribeiro e Neimar Fernandes"],
            ["Rio Grande do Sul", "Profe Borto"],
            ["Brasília", "Ray Cunha"],
            ["Diretor técnico digital", "Juan Carlos Sainz Perez"],
          ].map(([label, value]) => (
            <div key={label} className="border-b border-white/10 pb-5">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-mist-dim">
                {label}
              </dt>
              <dd className="mt-2 text-lg text-white">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-sm text-mist-muted">
          <Link href="/artigo/diretoria-executiva" className="text-gold">
            Diretoria executiva
          </Link>
          {" · "}
          <Link href="/artigo/conselhos" className="text-gold">
            Conselhos
          </Link>
          {" · "}
          <Link href="/artigo/fundadores" className="text-gold">
            Fundadores
          </Link>
        </p>
      </section>

      <p className="mt-10 text-sm leading-relaxed text-mist-muted">
        Os artigos e opiniões publicados são de inteira responsabilidade e
        autoria dos colunistas. O portal não se responsabiliza pelo conteúdo,
        ideias ou posicionamentos expressos nos textos. Correções de fato
        seguem a{" "}
        <Link href="/correcoes" className="text-gold">
          política de correções
        </Link>
        .
      </p>
    </div>
  );
}
