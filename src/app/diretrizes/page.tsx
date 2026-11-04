import Link from "next/link";
import { missao, valores, visao } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Diretrizes",
  description:
    "Missão, valores e visão da Ajoia Brasil — ética, fatos e liberdade de imprensa.",
  path: "/diretrizes",
});

export default function DiretrizesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
        Institucional
      </p>
      <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">
        Diretrizes
      </h1>

      <div className="mt-12 space-y-12">
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-mist-soft">
            Missão
          </h2>
          <p className="mt-4 font-serif text-lg leading-relaxed text-zinc-300">
            {missao}
          </p>
        </section>
        <div className="hairline" />
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-mist-soft">
            Valores
          </h2>
          <p className="mt-4 font-serif text-lg leading-relaxed text-zinc-300">
            {valores}
          </p>
        </section>
        <div className="hairline" />
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-mist-soft">
            Visão
          </h2>
          <p className="mt-4 font-serif text-lg leading-relaxed text-zinc-300">
            {visao}
          </p>
        </section>
        <div className="hairline" />
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-mist-soft">
            Correções
          </h2>
          <p className="mt-4 font-serif text-lg leading-relaxed text-zinc-300">
            Erro de fato se corrige no mesmo endereço, com a data de
            atualização visível. O procedimento está na{" "}
            <Link href="/correcoes" className="text-gold">
              política de correções
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
