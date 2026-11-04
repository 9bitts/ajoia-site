import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { siteConfig } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Assine",
  description:
    "Assine a Ajoia Brasil por R$ 25/mês e apoie o jornalismo independente com compromisso com os fatos.",
  path: "/assine",
});

const benefits = [
  {
    title: "Capa e seções sem ruído",
    body: "Política, Estado, Cidade, Mundo, Cultura e Opinião com hierarquia clara — o essencial primeiro.",
  },
  {
    title: "Colunistas com nome e responsabilidade",
    body: "Textos assinados por profissionais que defendem ética, rigor e liberdade de expressão.",
  },
  {
    title: "Apoio direto ao jornalismo independente",
    body: "Sua assinatura fortalece a rede da Ajoia e a produção editorial fora das grandes máquinas de narrativa.",
  },
];

const includes = [
  "Acesso completo ao portal",
  "Destaques e arquivo de publicações",
  "Painéis e colunas da redação",
  "Apoio à imprensa livre e responsável",
];

export default function AssinePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/images/sections/editorial.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>

        <div className="on-dark relative mx-auto grid max-w-content gap-10 px-4 py-14 sm:px-5 md:grid-cols-12 md:py-24">
          <div className="min-w-0 md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
              Assinatura Ajoia
            </p>
            <h1 className="mt-4 font-display text-[2rem] leading-[1.08] text-white sm:text-4xl md:text-5xl lg:text-[3.4rem]">
              Jornalismo independente, com compromisso com os fatos
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300 md:text-lg">
              Por{" "}
              <span className="font-semibold text-gold">R$ 25/mês</span>, você
              apoia a {siteConfig.name} e acompanha a cobertura que coloca rigor
              editorial acima de interesse e conveniência.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#plano" className="btn-gold text-xs tracking-[0.16em]">
                Assinar agora
              </a>
              <Link href="/quem-somos" className="btn-ghost">
                Conhecer a Ajoia →
              </Link>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-ink-soft md:aspect-[5/6]">
              <Image
                src="/images/sections/opiniao.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="on-dark absolute bottom-0 left-0 right-0 p-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold">
                  Belo Horizonte
                </p>
                <p className="mt-2 font-display text-2xl text-white">
                  Rede de jornalistas em defesa da imprensa livre
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-5 py-16">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
            Por que assinar
          </p>
          <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">
            Informação com clareza, sem abrir mão do rigor
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6"
            >
              <h3 className="font-display text-xl text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-ink-elevated/40 py-10">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-6 px-5">
          <BrandLogo href="/" size="md" />
          <p className="max-w-md text-sm leading-relaxed text-mist-muted">
            Associação Brasileira de Jornalistas Independentes e Afiliados —
            sede em Belo Horizonte, com alcance nacional.
          </p>
        </div>
      </section>

      <section id="plano" className="mx-auto max-w-content px-5 py-16 md:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
              Plano mensal
            </p>
            <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">
              Um valor acessível para sustentar a redação
            </h2>
            <p className="mt-4 text-base leading-relaxed text-mist-muted">
              A assinatura é o caminho mais direto para fortalecer o portal e a
              rede de colunistas. Sem pagamento configurado nesta etapa — o CTA
              abaixo é o ponto de conversão visual do plano.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="relative aspect-[16/11] overflow-hidden border border-white/10">
                <Image
                  src="/images/sections/politica.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
              <div className="relative aspect-[16/11] overflow-hidden border border-white/10">
                <Image
                  src="/images/sections/cidade.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="on-dark relative overflow-hidden border border-gold/35 bg-gradient-to-br from-[#1a1610] via-[#14120e] to-black p-6 sm:p-8 md:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
                  Assinatura mensal
                </p>
                <div className="mt-4 flex flex-wrap items-end gap-2">
                  <span className="font-display text-5xl text-white md:text-6xl">
                    R$ 25
                  </span>
                  <span className="mb-2 text-sm uppercase tracking-[0.16em] text-mist-dim">
                    / mês
                  </span>
                </div>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-mist-muted">
                  Acesso ao conteúdo da Ajoia e apoio contínuo ao jornalismo
                  independente.
                </p>

                <ul className="mt-8 space-y-3">
                  {includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-zinc-300"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="btn-gold mt-10 w-full text-xs tracking-[0.18em] md:w-auto md:min-w-[240px]"
                >
                  Assinar agora
                </button>
                <p className="mt-4 text-[11px] leading-relaxed text-mist-dim">
                  Design de conversão — pagamento será integrado em breve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
