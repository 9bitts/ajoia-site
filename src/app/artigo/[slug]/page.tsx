import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StoryCard } from "@/components/StoryCard";
import {
  getArticleBySlug,
  getLatestArticles,
  getPublishedSlugs,
} from "@/lib/articles";
import { formatDateLong } from "@/lib/format";
import { sectionMeta } from "@/lib/sections";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artigo" };
  return {
    title: article.title,
    description: article.dek,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = (await getLatestArticles(4)).filter(
    (a) => a.slug !== article.slug
  );
  const section = sectionMeta[article.section];
  const image = article.image;

  return (
    <article>
      <header className="mx-auto max-w-content px-5 pt-10 md:pt-14">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-mist-dim">
            <Link
              href={`/secao/${article.section}`}
              className="text-mist-soft transition-colors hover:text-white"
            >
              {section.label}
            </Link>
            <span>·</span>
            <time dateTime={article.date}>{formatDateLong(article.date)}</time>
          </div>
          <h1 className="mt-4 font-display text-3xl leading-[1.1] text-white md:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-mist-muted md:text-xl">
            {article.dek}
          </p>
          <p className="mt-6 text-sm text-mist-dim">
            Por{" "}
            <Link
              href={`/colunistas/${article.authorSlug}`}
              className="text-mist transition-colors hover:text-white"
            >
              {article.authorName}
            </Link>
          </p>
        </div>
      </header>

      <div className="relative mx-auto mt-10 min-h-[280px] max-w-content overflow-hidden bg-ink-soft md:min-h-[420px]">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="mx-auto grid max-w-content gap-12 px-5 py-12 lg:grid-cols-12">
        <div className="prose-ajoia lg:col-span-8">
          {article.body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
          <div className="mt-10 border-t border-white/10 pt-6 text-sm text-mist-dim">
            <p>
              Aviso: artigos e opiniões publicados são de inteira
              responsabilidade e autoria dos colunistas.
            </p>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-28 border border-white/10 bg-ink-elevated/50 p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-mist-dim">
              Continue lendo
            </p>
            <div className="mt-5 space-y-6">
              {related.slice(0, 3).map((item) => (
                <Link
                  key={item.slug}
                  href={`/artigo/${item.slug}`}
                  className="group block border-b border-white/5 pb-5 last:border-0"
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] text-mist-dim">
                    {sectionMeta[item.section].label}
                  </p>
                  <h3 className="mt-2 font-display text-lg leading-snug text-white transition-colors group-hover:text-mist">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <section className="mx-auto max-w-content px-5 pb-16">
        <h2 className="mb-8 font-display text-2xl text-white">Mais da Ajoia</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.slice(0, 3).map((item) => (
            <StoryCard key={item.slug} article={item} />
          ))}
        </div>
      </section>
    </article>
  );
}
