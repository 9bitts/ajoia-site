import Link from "next/link";
import type { Article, SectionSlug } from "@/data/articles";
import { sectionMeta } from "@/data/articles";
import { StoryCard } from "./StoryCard";

type Props = {
  section: SectionSlug;
  articles: Article[];
};

export function SectionBlock({ section, articles }: Props) {
  if (articles.length === 0) return null;
  const meta = sectionMeta[section];
  const [lead, ...rest] = articles;

  return (
    <section className="mx-auto max-w-content px-5 py-14">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
            Seção
          </p>
          <h2 className="mt-1 font-display text-3xl text-white md:text-4xl">
            {meta.label}
          </h2>
        </div>
        <Link href={`/secao/${section}`} className="btn-ghost shrink-0">
          Ver seção →
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StoryCard article={lead} size="lg" showDek />
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          {rest.slice(0, 3).map((article) => (
            <StoryCard key={article.slug} article={article} size="sm" />
          ))}
        </div>
      </div>
    </section>
  );
}
