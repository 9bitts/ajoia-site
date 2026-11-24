"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCents } from "@/lib/store-format";
import { readCart, writeCart, type CartLine } from "@/lib/store-cart";

type RemoteItem = {
  slug: string;
  name: string;
  priceCents: number;
  stock: number;
  coverUrl: string | null;
  coverAlt: string;
  authors: string;
  kind: string;
};

export function CartView({ showCheckoutLink = true }: { showCheckoutLink?: boolean }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [items, setItems] = useState<RemoteItem[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = readCart();
    setLines(stored);
    if (!stored.length) {
      setReady(true);
      return;
    }
    const slugs = stored.map((line) => line.slug).join(",");
    fetch(`/api/livraria/sacola?slugs=${encodeURIComponent(slugs)}`)
      .then(async (res) => {
        const json = (await res.json()) as { items?: RemoteItem[]; error?: string };
        if (!res.ok) throw new Error(json.error || "Não foi possível ler a sacola.");
        setItems(json.items || []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Não foi possível ler a sacola.");
      })
      .finally(() => setReady(true));
  }, []);

  function update(next: CartLine[]) {
    writeCart(next);
    setLines(next);
  }

  const rows = lines.flatMap((line) => {
    const item = items.find((candidate) => candidate.slug === line.slug);
    if (!item) return [];
    const quantity = Math.min(line.quantity, Math.max(item.stock, 0));
    return [{ line, item, quantity }];
  });

  const total = rows.reduce((sum, row) => sum + row.item.priceCents * row.quantity, 0);

  if (!ready) return <p className="mt-8 text-sm text-mist-muted">Abrindo a sacola…</p>;

  if (!lines.length) {
    return (
      <p className="mt-8 text-sm text-mist-muted">
        A sacola está vazia.{" "}
        <Link href="/livraria" className="text-[var(--text)]">
          Ver a livraria
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="mt-8">
      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
      <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {rows.map(({ line, item, quantity }) => (
          <li key={item.slug} className="flex gap-4 py-4">
            <div className="relative h-24 w-16 shrink-0 bg-[var(--bg-soft)]">
              {item.coverUrl && (
                <Image src={item.coverUrl} alt={item.coverAlt || item.name} fill sizes="64px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/livraria/p/${item.slug}`} className="font-display text-xl text-[var(--text)]">
                {item.name}
              </Link>
              {item.kind === "LIVRO" && item.authors && (
                <p className="text-sm text-mist-muted">{item.authors}</p>
              )}
              <p className="mt-1 text-sm">{formatCents(item.priceCents)}</p>
              {item.stock < 1 && <p className="mt-1 text-xs text-mist-muted">Esgotado</p>}
              {item.stock > 0 && quantity < line.quantity && (
                <p className="mt-1 text-xs text-mist-muted">A quantidade foi limitada ao estoque ({item.stock}).</p>
              )}
              <div className="mt-3 flex items-center gap-3 text-sm">
                <button
                  type="button"
                  className="h-11 w-11 border border-[var(--line)]"
                  onClick={() =>
                    update(
                      quantity <= 1
                        ? lines.filter((entry) => entry.slug !== item.slug)
                        : lines.map((entry) =>
                            entry.slug === item.slug ? { ...entry, quantity: quantity - 1 } : entry,
                          ),
                    )
                  }
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  className="h-11 w-11 border border-[var(--line)]"
                  disabled={quantity >= item.stock}
                  onClick={() =>
                    update(lines.map((entry) => (entry.slug === item.slug ? { ...entry, quantity: quantity + 1 } : entry)))
                  }
                >
                  +
                </button>
                <button
                  type="button"
                  className="text-xs uppercase tracking-[0.14em] text-mist-dim"
                  onClick={() => update(lines.filter((entry) => entry.slug !== item.slug))}
                >
                  Remover
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {lines.length > 0 && rows.length === 0 && !error && (
        <p className="mt-4 text-sm text-mist-muted">Os itens desta sacola não estão mais publicados.</p>
      )}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">Total</p>
          <p className="mt-1 font-display text-3xl text-[var(--text)]">{formatCents(total)}</p>
          <p className="mt-2 max-w-md text-xs text-mist-muted">Sem frete. O frete entra no checkout junto com o pagamento.</p>
        </div>
        {showCheckoutLink && (
          <div className="max-w-sm">
            <button
              type="button"
              disabled
              className="btn-primary cursor-not-allowed text-xs uppercase tracking-[0.14em] opacity-50"
            >
              Ir para o pagamento
            </button>
            <p className="mt-3 text-sm text-mist-muted">
              O pagamento entra em seguida. Enquanto isso, a sacola fica só neste navegador.
            </p>
            <Link href="/livraria/checkout" className="mt-3 inline-flex text-sm text-[var(--text)] underline-offset-4 hover:underline">
              Revisar dados de entrega
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
