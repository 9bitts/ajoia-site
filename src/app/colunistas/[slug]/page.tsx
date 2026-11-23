import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ColumnistAvatar } from "@/components/ColumnistAvatar";
import { JsonLd } from "@/components/JsonLd";
import { PageNumbers } from "@/components/PageNumbers";
import { StoryCard } from "@/components/StoryCard";
import { archivePage, getColumnistBySlug, getPublishedPage } from "@/lib/articles";
import { siteConfig } from "@/data/site";
import { columnistJsonLd, shareImage } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const columnist = await getColumnistBySlug(slug);
  if (!columnist) return { title: "Colunista" };
  return {
    title: columnist.name,
    description: columnist.bio,
    alternates: { canonical: `/colunistas/${columnist.slug}` },
    openGraph: {
      title: columnist.name,
      description: columnist.bio,
      url: `/colunistas/${columnist.slug}`,
      locale: "pt_BR",
      type: "website",
      siteName: siteConfig.name,
      images: [shareImage],
    },
  };
}

export default async function ColumnistPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const columnist = await getColumnistBySlug(slug);
  if (!columnist) notFound();

  const requested = archivePage((await searchParams).page);
  const result = await getPublishedPage({ page: requested, authorSlug: columnist.slug });
  const path = `/colunistas/${columnist.slug}`;
  if (requested > result.pages) {
    redirect(result.pages <= 1 ? path : `${path}?page=${result.pages}`);
  }

  return (
    <div className="mx-auto max-w-content px-5 py-12 md:py-16">
      <JsonLd data={columnistJsonLd(columnist)} />
      <Link href="/colunistas" className="btn-ghost">
        ← Todos os colunistas
      </Link>

      <header className="mt-8 grid gap-8 border-b border-[var(--line)] pb-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <ColumnistAvatar
            name={columnist.name}
            avatarUrl={columnist.avatarUrl}
            size="lg"
          />
        </div>
        <div className="md:col-span-9">
          <p className="kicker">{columnist.role}</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">
            {columnist.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-mist-muted">
            {columnist.bio}
          </p>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="border-b-2 border-gold pb-1 font-display text-2xl text-[var(--text)]">
          Publicações
        </h2>
        {result.articles.length > 0 ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {result.articles.map((article) => (
              <StoryCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-mist-muted">
            Em breve, novos textos deste colunista.
          </p>
        )}
        <PageNumbers page={requested} pages={result.pages} path={path} />
      </section>
    </div>
  );
}
