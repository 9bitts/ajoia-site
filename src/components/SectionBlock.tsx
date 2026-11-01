import Link from "next/link";
import type { PublicArticle } from "@/lib/articles";
import type { SectionSlug } from "@/lib/sections";
import { sectionMeta } from "@/lib/sections";
import { StoryCard } from "./StoryCard";

type Props = {
  section: SectionSlug;
  articles: PublicArticle[];
};

export function SectionBlock({ section, articles }: Props) {
  if (articles.length === 0) return null;
  const meta = sectionMeta[section];
  const [lead, ...rest] = articles;

  return (
    <section className="mx-auto max-w-content px-4 py-10 sm:px-5">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--line)] pb-3">
        <h2 className="border-b-2 border-gold pb-1 font-display text-3xl text-[var(--text)] md:text-4xl">
          {meta.label}
        </h2>
        <Link
          href={`/secao/${section}`}
          className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-gold"
        >
          Ver seção →
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <StoryCard article={lead} size="lg" showDek />
        </div>
        <div className="divide-y divide-[var(--line)] lg:col-span-7">
          {rest.slice(0, 4).map((article) => (
            <StoryCard key={article.slug} article={article} variant="row" />
          ))}
        </div>
      </div>
    </section>
  );
}
