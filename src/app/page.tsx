import type { Metadata } from "next";
import Link from "next/link";
import { ColumnistRail } from "@/components/ColumnistRail";
import { HeroFeature } from "@/components/HeroFeature";
import { JsonLd } from "@/components/JsonLd";
import { Newsletter } from "@/components/Newsletter";
import { SectionBlock } from "@/components/SectionBlock";
import { Ticker } from "@/components/Ticker";
import {
  getArticlesBySection,
  getFeaturedArticles,
  getLatestArticles,
} from "@/lib/articles";
import { missao, siteConfig } from "@/data/site";
import { homeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: siteConfig.name }],
    },
  },
};

export default async function HomePage() {
  const featured = await getFeaturedArticles();
  const lead = featured[0];
  const side = featured.slice(1, 4);
  const latest = await getLatestArticles(12);
  const politica = await getArticlesBySection("politica");
  const cidade = await getArticlesBySection("cidade");
  const opiniao = await getArticlesBySection("opiniao");
  const estado = await getArticlesBySection("estado");

  return (
    <>
      <JsonLd data={homeJsonLd()} />
      {lead ? (
        <>
          <Ticker />
          <HeroFeature lead={lead} side={side} latest={latest} />
          <SectionBlock section="politica" articles={politica} />
        </>
      ) : (
        <section className="mx-auto max-w-content px-5 py-16">
          <p className="text-sm text-mist-muted">
            Em breve, novas publicações na capa.
          </p>
        </section>
      )}

      <section className="border-y border-[var(--line)] bg-[var(--bg-soft)]">
        <div className="mx-auto grid max-w-content gap-6 px-5 py-12 md:grid-cols-12 md:items-center">
          <div className="md:col-span-4">
            <p className="kicker">Institucional</p>
            <h2 className="mt-2 font-display text-3xl text-[var(--text)]">
              Por que a {siteConfig.shortName} existe
            </h2>
          </div>
          <div className="md:col-span-8">
            <p className="font-serif text-lg leading-relaxed text-mist-muted">
              {missao}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/quem-somos"
                className="btn-primary text-xs uppercase tracking-[0.14em]"
              >
                Quem somos
              </Link>
              <Link
                href="/diretrizes"
                className="text-xs font-bold uppercase tracking-[0.14em] text-gold"
              >
                Diretrizes →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {lead && (
        <>
          <SectionBlock section="cidade" articles={cidade} />
          <ColumnistRail />
          <SectionBlock section="opiniao" articles={opiniao} />
          <SectionBlock section="estado" articles={estado} />
          <Newsletter />
        </>
      )}
    </>
  );
}
