import Link from "next/link";
import { SacolaLink } from "@/components/store/AddToCartButton";
import { StoreItemCard } from "@/components/store/StoreItemCard";
import { pageMetadata } from "@/lib/seo";
import { listPublishedHome } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Livraria",
  description: "Livros e itens da livraria da Ajoia Brasil.",
  path: "/livraria",
});

export default async function LivrariaPage() {
  const { featured, recent, categories } = await listPublishedHome();

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-5 md:py-14">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--line)] pb-6">
        <div className="max-w-2xl">
          <p className="kicker">Livraria</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">Livraria</h1>
          <p className="mt-4 text-base leading-relaxed text-mist-muted">
            Livros e outros itens à venda pela Ajoia Brasil. O catálogo é separado das editorias do jornal.
          </p>
        </div>
        <SacolaLink />
      </header>

      <form action="/livraria/busca" className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="q">
          Buscar na livraria
        </label>
        <input
          id="q"
          name="q"
          placeholder="Título, autor, ISBN ou editora"
          className="min-h-11 flex-1 border border-[var(--line)] bg-transparent px-4 text-[var(--text)] outline-none"
        />
        <button type="submit" className="btn-primary text-xs uppercase tracking-[0.14em]">
          Buscar
        </button>
      </form>

      {categories.length > 0 && (
        <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/livraria/c/${category.slug}`}
              className="text-sm text-mist-muted hover:text-[var(--text)]"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      )}

      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-3xl text-[var(--text)]">Destaques</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item) => (
              <StoreItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-14">
        <h2 className="font-display text-3xl text-[var(--text)]">Novidades</h2>
        {recent.length > 0 ? (
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((item) => (
              <StoreItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-mist-muted">A livraria ainda não tem itens publicados.</p>
        )}
      </section>
    </div>
  );
}
