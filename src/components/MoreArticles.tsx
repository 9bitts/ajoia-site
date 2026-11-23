"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { MoreArticleCard } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { sectionMeta } from "@/lib/sections";

type Props = {
  excludeSlug: string;
  initial: MoreArticleCard[];
  initialHasMore: boolean;
};

export function MoreArticles({ excludeSlug, initial, initialHasMore }: Props) {
  const [items, setItems] = useState(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadMore() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        offset: String(items.length),
        exclude: excludeSlug,
      });
      const res = await fetch(`/api/mais?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não foi possível carregar");
      const next = (json.articles || []) as MoreArticleCard[];
      setItems((current) => {
        const seen = new Set(current.map((item) => item.slug));
        return [...current, ...next.filter((item) => !seen.has(item.slug))];
      });
      setHasMore(Boolean(json.hasMore));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar");
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-content px-4 pb-16 sm:px-5">
      <h2 className="mb-4 border-b-2 border-gold pb-1 font-display text-2xl text-[var(--text)]">
        Mais notícias
      </h2>
      <ul className="divide-y divide-[var(--line)]">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/artigo/${item.slug}`}
              className="group flex items-center gap-3 py-3"
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-[var(--bg-soft)]">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.imageAlt || ""}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mist-dim">
                  {sectionMeta[item.section].label}
                  {" · "}
                  {formatDate(item.date)}
                </p>
                <h3 className="mt-0.5 font-sans text-sm font-semibold leading-snug text-[var(--text)] group-hover:text-gold">
                  {item.title}
                </h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {hasMore && (
        <button
          type="button"
          onClick={() => void loadMore()}
          disabled={loading}
          className="mt-4 inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-[0.14em] text-gold disabled:opacity-50"
        >
          {loading ? "Carregando…" : "Carregar mais 20"}
        </button>
      )}
    </section>
  );
}
