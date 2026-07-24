import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StoryCard } from "@/components/StoryCard";
import { getArticlesBySection } from "@/lib/articles";
import {
  isSectionSlug,
  sectionMeta,
  type SectionSlug,
} from "@/lib/sections";
import { navSections } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return navSections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isSectionSlug(slug)) return { title: "Seção" };
  const meta = sectionMeta[slug];
  return { title: meta.label, description: meta.description };
}

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  if (!isSectionSlug(slug)) notFound();
  const section = slug as SectionSlug;
  const meta = sectionMeta[section];
  const list = await getArticlesBySection(section);

  return (
    <div className="mx-auto max-w-content px-5 py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
          Seção
        </p>
        <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">
          {meta.label}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-mist-muted">
          {meta.description}
        </p>
      </header>

      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {list.length > 0 ? (
          list.map((article) => (
            <StoryCard key={article.slug} article={article} showDek />
          ))
        ) : (
          <p className="col-span-full text-mist-muted">
            Em breve, novos conteúdos nesta seção.
          </p>
        )}
      </div>
    </div>
  );
}
