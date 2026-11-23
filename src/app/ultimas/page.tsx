import Link from "next/link";
import { redirect } from "next/navigation";
import { PageNumbers } from "@/components/PageNumbers";
import { StoryCard } from "@/components/StoryCard";
import { archivePage, getPublishedPage } from "@/lib/articles";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Últimas",
  description: "Todas as publicações recentes da Ajoia Brasil.",
  path: "/ultimas",
});

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ page?: string }> };

export default async function UltimasPage({ searchParams }: Props) {
  const requested = archivePage((await searchParams).page);
  const result = await getPublishedPage({ page: requested });
  if (requested > result.pages) redirect(result.pages <= 1 ? "/ultimas" : `/ultimas?page=${result.pages}`);

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

      {result.articles.length > 0 ? (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {result.articles.map((article) => (
            <StoryCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-mist-muted">Em breve, novas publicações.</p>
      )}
      <PageNumbers page={requested} pages={result.pages} path="/ultimas" />
    </div>
  );
}
