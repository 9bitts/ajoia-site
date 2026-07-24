import Link from "next/link";
import { ColumnistRail } from "@/components/ColumnistRail";
import { HeroFeature } from "@/components/HeroFeature";
import { Newsletter } from "@/components/Newsletter";
import { SectionBlock } from "@/components/SectionBlock";
import { StoryCard } from "@/components/StoryCard";
import { Ticker } from "@/components/Ticker";
import {
  getArticlesBySection,
  getFeaturedArticles,
  getLatestArticles,
} from "@/lib/articles";
import { missao, siteConfig } from "@/data/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedArticles();
  const lead = featured[0];
  const side = featured.slice(1, 4);
  const latest = await getLatestArticles(6);
  const politica = await getArticlesBySection("politica");
  const cidade = await getArticlesBySection("cidade");
  const opiniao = await getArticlesBySection("opiniao");
  const estado = await getArticlesBySection("estado");

  if (!lead) {
    return (
      <div className="mx-auto max-w-content px-5 py-24 text-center">
        <h1 className="font-display text-4xl text-white">Ajoia Brasil</h1>
        <p className="mt-4 text-mist-muted">
          Nenhuma notícia publicada ainda. Acesse o admin para publicar.
        </p>
        <Link href="/admin" className="btn-primary mt-8 inline-flex text-xs uppercase tracking-[0.14em]">
          Ir ao admin
        </Link>
      </div>
    );
  }

  return (
    <>
      <Ticker />
      <HeroFeature lead={lead} side={side} />

      <section className="mx-auto max-w-content px-5 py-14">
        <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
          <h2 className="font-display text-3xl text-white">Últimas</h2>
          <Link href="/ultimas" className="btn-ghost">
            Arquivo →
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((article) => (
            <StoryCard key={article.slug} article={article} showDek />
          ))}
        </div>
      </section>

      <SectionBlock section="politica" articles={politica} />

      <section className="mx-auto max-w-content px-5 py-6">
        <div className="grid gap-8 border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent p-8 md:grid-cols-12 md:p-12">
          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-mist-soft">
              Institucional
            </p>
            <h2 className="mt-2 font-display text-3xl text-white">
              Por que a {siteConfig.shortName} existe
            </h2>
          </div>
          <div className="md:col-span-8">
            <p className="font-serif text-lg leading-relaxed text-zinc-300">
              {missao}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/quem-somos"
                className="btn-primary text-xs uppercase tracking-[0.14em]"
              >
                Quem somos
              </Link>
              <Link href="/diretrizes" className="btn-ghost">
                Diretrizes →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SectionBlock section="cidade" articles={cidade} />
      <ColumnistRail />
      <SectionBlock section="opiniao" articles={opiniao} />
      <SectionBlock section="estado" articles={estado} />
      <Newsletter />
    </>
  );
}
