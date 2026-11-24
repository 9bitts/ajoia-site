import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SacolaLink } from "@/components/store/AddToCartButton";
import { StoreItemCard } from "@/components/store/StoreItemCard";
import { getCategoryBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  if (!category) return { title: "Livraria" };
  return {
    title: category.name,
    description: category.description || `Itens de ${category.name} na livraria da Ajoia Brasil.`,
    alternates: { canonical: `/livraria/c/${category.slug}` },
  };
}

export default async function CategoriaPage({ params }: Props) {
  const category = await getCategoryBySlug((await params).slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-5 md:py-14">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--line)] pb-6">
        <div className="max-w-2xl">
          <p className="kicker">Livraria</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">{category.name}</h1>
          {category.description && (
            <p className="mt-4 text-base leading-relaxed text-mist-muted">{category.description}</p>
          )}
        </div>
        <SacolaLink />
      </header>
      {category.items.length > 0 ? (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {category.items.map((item) => (
            <StoreItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-mist-muted">Nenhum item publicado nesta categoria.</p>
      )}
    </div>
  );
}
