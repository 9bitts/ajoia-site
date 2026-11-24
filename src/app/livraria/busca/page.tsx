import type { Metadata } from "next";
import { SacolaLink } from "@/components/store/AddToCartButton";
import { StoreItemCard } from "@/components/store/StoreItemCard";
import { searchPublished } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = ((await searchParams).q || "").trim();
  return {
    title: q ? `Busca: ${q}` : "Busca na livraria",
    description: "Busca de livros e itens da livraria da Ajoia Brasil.",
    robots: { index: false, follow: true },
  };
}

export default async function BuscaPage({ searchParams }: Props) {
  const q = ((await searchParams).q || "").trim().slice(0, 80);
  const items = q.length >= 2 ? await searchPublished(q) : [];

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-5 md:py-14">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--line)] pb-6">
        <div>
          <p className="kicker">Livraria</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--text)]">Busca</h1>
        </div>
        <SacolaLink />
      </header>
      <form action="/livraria/busca" className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="q">
          Buscar
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Título, autor, ISBN ou editora"
          className="min-h-11 flex-1 border border-[var(--line)] bg-transparent px-4 text-[var(--text)] outline-none"
        />
        <button type="submit" className="btn-primary text-xs uppercase tracking-[0.14em]">
          Buscar
        </button>
      </form>
      {q.length < 2 ? (
        <p className="mt-8 text-sm text-mist-muted">Digite um título, autor, ISBN ou editora.</p>
      ) : items.length > 0 ? (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <StoreItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-mist-muted">Nenhum item publicado para “{q}”.</p>
      )}
    </div>
  );
}
