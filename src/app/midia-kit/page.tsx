import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Mídia Kit",
  description: "Publicidade e parcerias no portal Ajoia Brasil.",
};

export default function MidiaKitPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
        Comercial
      </p>
      <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">
        Mídia Kit
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-mist-muted">
        Anuncie em um portal de jornalismo independente com audiência qualificada
        — política, opinião, cidade e cultura, com estética editorial premium.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {[
          {
            title: "Capa e destaques",
            body: "Presença nos blocos de maior visibilidade da homepage.",
          },
          {
            title: "Seções temáticas",
            body: "Inserções em Política, Cidade, Estado, Cultura e Opinião.",
          },
          {
            title: "Newsletter",
            body: "Patrocínio do painel diário enviado aos assinantes.",
          },
          {
            title: "Projetos especiais",
            body: "Conteúdos patrocinados com transparência editorial.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="border border-white/10 bg-white/[0.02] p-6"
          >
            <h2 className="font-display text-xl text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-mist-muted">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 border border-white/10 p-8">
        <p className="text-sm text-mist-muted">
          Para briefing e valores, fale com a área comercial:
        </p>
        <a
          href={`mailto:${siteConfig.email}?subject=Mídia%20Kit%20Ajoia`}
          className="mt-3 inline-block font-display text-2xl text-mist transition-colors hover:text-white"
        >
          {siteConfig.email}
        </a>
        <div className="mt-6">
          <Link href="/contato" className="btn-ghost">
            Formulário de contato →
          </Link>
        </div>
      </div>
    </div>
  );
}
