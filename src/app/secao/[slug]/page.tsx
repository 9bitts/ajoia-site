import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PageNumbers } from "@/components/PageNumbers";
import { StoryCard } from "@/components/StoryCard";
import { navSections, siteConfig } from "@/data/site";
import { archivePage, getPublishedPage } from "@/lib/articles";
import { sectionJsonLd, shareImage } from "@/lib/seo";
import {
  isSectionSlug,
  sectionMeta,
  type SectionSlug,
} from "@/lib/sections";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return navSections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isSectionSlug(slug)) return { title: "Seção" };
  const meta = sectionMeta[slug];
  return {
    title: meta.label,
    description: meta.description,
    alternates: {
      canonical: `/secao/${slug}`,
      types: {
        "application/rss+xml": [
          { url: `/secao/${slug}/feed.xml`, title: meta.label },
        ],
      },
    },
    openGraph: {
      title: meta.label,
      description: meta.description,
      url: `/secao/${slug}`,
      locale: "pt_BR",
      type: "website",
      siteName: siteConfig.name,
      images: [shareImage],
    },
  };
}

export default async function SectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!isSectionSlug(slug)) notFound();
  const section = slug as SectionSlug;
  const meta = sectionMeta[section];
  const requested = archivePage((await searchParams).page);
  const result = await getPublishedPage({ page: requested, section });
  const path = `/secao/${section}`;
  if (requested > result.pages) {
    redirect(result.pages <= 1 ? path : `${path}?page=${result.pages}`);
  }

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-5 md:py-14">
      <JsonLd data={sectionJsonLd(section)} />
      <header className="max-w-2xl border-b border-[var(--line)] pb-6">
        <p className="kicker">Seção</p>
        <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">
          {meta.label}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-mist-muted">
          {meta.description}
        </p>
      </header>

      {result.articles.length > 0 ? (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {result.articles.map((article) => (
            <StoryCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-mist-muted">
          Em breve, novos conteúdos nesta seção.
        </p>
      )}
      <PageNumbers page={requested} pages={result.pages} path={path} />
    </div>
  );
}
