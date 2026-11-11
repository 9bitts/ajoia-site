import Link from "next/link";
import { StoryCard } from "@/components/StoryCard";
import { getLatestArticles } from "@/lib/articles";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Últimas",
  description: "Todas as publicações recentes da Ajoia Brasil.",
  path: "/ultimas",
});

export const dynamic = "force-dynamic";

export default async function UltimasPage() {
  const list = await getLatestArticles(400);

  const [lead, ...rest] = list;

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-5 md:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <p className="kicker">Arquivo</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">
            Últimas
          </h1>
        </div>
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-[0.14em] text-gold"
        >
          Voltar à capa →
        </Link>
      </header>

      {lead && (
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <StoryCard article={lead} size="lg" showDek />
          </div>
          <div className="divide-y divide-[var(--line)] lg:col-span-7">
            {rest.map((article) => (
              <StoryCard key={article.slug} article={article} variant="row" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
