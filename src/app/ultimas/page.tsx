import Link from "next/link";
import type { Metadata } from "next";
import { StoryCard } from "@/components/StoryCard";
import { getLatestArticles } from "@/data/articles";

export const metadata: Metadata = {
  title: "Últimas",
  description: "Todas as publicações recentes da Ajoia Brasil.",
};

export default function UltimasPage() {
  const list = getLatestArticles(24);

  return (
    <div className="mx-auto max-w-content px-5 py-12 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
            Arquivo
          </p>
          <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">
            Últimas
          </h1>
        </div>
        <Link href="/" className="btn-ghost">
          Voltar à capa →
        </Link>
      </header>

      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((article) => (
          <StoryCard key={article.slug} article={article} showDek />
        ))}
      </div>
    </div>
  );
}
