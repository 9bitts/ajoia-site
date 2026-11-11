import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { AdSlot, AdStack } from "@/components/AdSlot";
import { ArticleAnalytics } from "@/components/ArticleAnalytics";
import { JsonLd } from "@/components/JsonLd";
import { StoryCard } from "@/components/StoryCard";
import { sidebarAds } from "@/data/ads";
import {
  getArticleBySlug,
  getLatestArticles,
} from "@/lib/articles";
import { formatDateLong, saoPauloDay } from "@/lib/format";
import { findRedirectTarget } from "@/lib/redirects";
import { articleJsonLd, articleMetadata } from "@/lib/seo";
import { sectionMeta } from "@/lib/sections";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artigo" };
  return articleMetadata(article);
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    const target = await findRedirectTarget(`/artigo/${slug}`);
    if (target) redirect(target);
    notFound();
  }

  const related = (await getLatestArticles(4)).filter(
    (a) => a.slug !== article.slug
  );
  const section = sectionMeta[article.section];
  const image = article.image;
  const publishedDay = saoPauloDay(article.publishedAt);
  const updatedDay = saoPauloDay(article.updatedAt);

  return (
    <article>
      <JsonLd data={articleJsonLd(article)} />
      <ArticleAnalytics
        section={section.label}
        author={article.authorName}
        title={article.title}
      />
      <div className="mx-auto grid max-w-content items-start gap-10 px-4 py-8 sm:px-5 sm:py-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          <header>
            <div className="flex flex-wrap items-center gap-3 text-xs text-mist-dim">
              <Link href={`/secao/${article.section}`} className="kicker">
                {section.label}
              </Link>
              {article.isOpinion && article.section !== "opiniao" && (
                <span className="kicker">Opinião</span>
              )}
              <time dateTime={article.publishedAt}>
                {formatDateLong(article.date)}
              </time>
              {updatedDay !== publishedDay && (
                <time dateTime={article.updatedAt}>
                  Atualizado em {formatDateLong(updatedDay)}
                </time>
              )}
            </div>
            <h1 className="mt-3 font-display text-[1.85rem] leading-[1.08] text-[var(--text)] sm:text-4xl md:text-5xl">
              {article.title}
            </h1>
            <p className="mt-5 font-serif text-lg leading-relaxed text-mist-muted md:text-xl">
              {article.dek}
            </p>
            <p className="mt-6 border-t border-[var(--line)] pt-4 text-sm text-mist-dim">
              Por{" "}
              <Link
                href={`/colunistas/${article.authorSlug}`}
                className="font-semibold text-[var(--text)] hover:text-gold"
              >
                {article.authorName}
              </Link>
            </p>
          </header>

          <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-2xl bg-[var(--bg-soft)]">
            {image && (
              <Image
                src={image}
                alt={article.imageAlt || article.title}
                fill
                priority
                unoptimized={image.startsWith("/uploads/")}
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            )}
          </div>

          {sidebarAds[0] && (
            <div className="mt-8 lg:hidden">
              <AdSlot ad={sidebarAds[0]} showLabel />
            </div>
          )}

          <div className="prose-ajoia mt-8">
            {article.html ? (
              <div dangerouslySetInnerHTML={{ __html: article.html }} />
            ) : (
              article.body.map((paragraph) => (
                <p key={paragraph.slice(0, 80)}>{paragraph}</p>
              ))
            )}
            <div className="mt-10 border-t border-[var(--line)] pt-6 text-sm text-mist-dim">
              <p>
                Aviso: artigos e opiniões publicados são de inteira
                responsabilidade e autoria dos colunistas.
              </p>
            </div>
          </div>
        </div>

        <aside className="min-w-0 lg:col-span-4">
          <div className="hidden lg:block">
            <AdStack ads={sidebarAds} />
          </div>
          <div className="rounded-2xl bg-[var(--bg-soft)] p-5 sm:p-6 lg:mt-8">
            <p className="font-sans text-lg font-bold tracking-tight text-[var(--text)]">
              Continue lendo
            </p>
            <div className="mt-2 divide-y divide-[var(--line)]">
              {related.slice(0, 4).map((item) => (
                <Link
                  key={item.slug}
                  href={`/artigo/${item.slug}`}
                  className="group block py-3.5"
                >
                  <p className="kicker">{sectionMeta[item.section].label}</p>
                  <h3 className="mt-1 font-sans text-[15px] font-semibold leading-snug text-[var(--text)] group-hover:text-gold">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
          {sidebarAds.length > 1 && (
            <div className="mt-8 lg:hidden">
              <AdStack ads={sidebarAds.slice(1)} />
            </div>
          )}
        </aside>
      </div>

      <section className="mx-auto max-w-content px-4 pb-16 sm:px-5">
        <h2 className="mb-8 border-b-2 border-gold pb-1 font-display text-2xl text-[var(--text)]">
          Mais da Ajoia
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.slice(0, 3).map((item) => (
            <StoryCard key={item.slug} article={item} />
          ))}
        </div>
      </section>
    </article>
  );
}
