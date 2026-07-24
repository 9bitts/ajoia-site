import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StoryCard } from "@/components/StoryCard";
import {
  getArticlesBySection,
  sectionMeta,
  type SectionSlug,
} from "@/data/articles";
import { navSections } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return navSections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = sectionMeta[slug as SectionSlug];
  if (!meta) return { title: "Seção" };
  return { title: meta.label, description: meta.description };
}

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  const section = slug as SectionSlug;
  const meta = sectionMeta[section];
  if (!meta) notFound();

  const list = getArticlesBySection(section);

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
          <p className="text-mist-muted col-span-full">
            Em breve, novos conteúdos nesta seção.
          </p>
        )}
      </div>
    </div>
  );
}
