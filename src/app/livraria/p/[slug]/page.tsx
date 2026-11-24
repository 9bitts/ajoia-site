import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton, SacolaLink } from "@/components/store/AddToCartButton";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site-url";
import { bindingLabel, formatCents, stockLabel } from "@/lib/store-format";
import { getPublishedBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getPublishedBySlug((await params).slug);
  if (!item) return { title: "Livraria" };
  const description = item.synopsis || item.name;
  return {
    title: item.name,
    description,
    alternates: { canonical: `/livraria/p/${item.slug}` },
    openGraph: {
      title: item.name,
      description,
      url: `/livraria/p/${item.slug}`,
      type: "website",
      images: item.coverUrl ? [{ url: item.coverUrl, alt: item.coverAlt || item.name }] : undefined,
    },
  };
}

export default async function ItemPage({ params }: Props) {
  const item = await getPublishedBySlug((await params).slug);
  if (!item) notFound();

  const facts = [
    item.kind === "LIVRO" ? ["Autor", item.authors] : null,
    item.publisher ? ["Editora", item.publisher] : null,
    item.edition ? ["Edição", item.edition] : null,
    item.year ? ["Ano", String(item.year)] : null,
    item.pages ? ["Páginas", String(item.pages)] : null,
    item.language ? ["Idioma", item.language] : null,
    item.binding ? ["Capa", bindingLabel[item.binding]] : null,
    item.isbn13 ? ["ISBN", item.isbn13] : null,
  ].filter((row): row is [string, string] => Boolean(row && row[1]));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": item.kind === "LIVRO" ? "Book" : "Product",
    name: item.name,
    description: item.synopsis || item.description || item.name,
    sku: item.isbn13 || item.slug,
    ...(item.coverUrl ? { image: absoluteUrl(item.coverUrl) } : {}),
    ...(item.isbn13 ? { isbn: item.isbn13 } : {}),
    ...(item.authors ? { author: item.authors } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: (item.priceCents / 100).toFixed(2),
      availability: item.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/livraria/p/${item.slug}`),
    },
  };

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-5 md:py-14">
      <JsonLd data={jsonLd} />
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/livraria" className="text-[11px] uppercase tracking-[0.16em] text-mist-dim hover:text-[var(--text)]">
          Livraria
        </Link>
        <SacolaLink />
      </div>
      <article className="grid gap-10 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
        <div className="relative aspect-[2/3] bg-[var(--bg-soft)]">
          {item.coverUrl ? (
            <Image
              src={item.coverUrl}
              alt={item.coverAlt || item.name}
              fill
              priority
              sizes="(min-width: 768px) 256px, 80vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-end p-5">
              <p className="font-display text-3xl text-[var(--text)]">{item.name}</p>
            </div>
          )}
        </div>
        <div>
          {item.category && (
            <Link href={`/livraria/c/${item.category.slug}`} className="kicker hover:text-[var(--text)]">
              {item.category.name}
            </Link>
          )}
          <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">{item.name}</h1>
          {item.synopsis && <p className="mt-4 max-w-xl text-lg leading-relaxed text-mist-muted">{item.synopsis}</p>}
          <p className="mt-6 font-display text-3xl text-[var(--text)]">{formatCents(item.priceCents)}</p>
          <p className="mt-2 text-sm text-mist-muted">{stockLabel(item.stock)}</p>
          <div className="mt-6">
            <AddToCartButton slug={item.slug} stock={item.stock} />
          </div>
          {facts.length > 0 && (
            <dl className="mt-10 grid gap-3 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">{label}</dt>
                  <dd className="mt-1 text-sm text-[var(--text)]">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {item.description && (
            <div className="mt-10 max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-[var(--text)]">
              {item.description}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
