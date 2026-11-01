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

  const [lead, ...rest] = list;

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-5 md:py-14">
      <header className="max-w-2xl border-b border-[var(--line)] pb-6">
        <p className="kicker">Seção</p>
        <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">
          {meta.label}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-mist-muted">
          {meta.description}
        </p>
      </header>

      {lead ? (
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <StoryCard article={lead} size="lg" showDek />
          </div>
          <div className="divide-y divide-[var(--line)] lg:col-span-7">
            {rest.map((article) => (
              <StoryCard key={article.slug} article={article} variant="row" />
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-10 text-mist-muted">
          Em breve, novos conteúdos nesta seção.
        </p>
      )}
    </div>
  );
}
