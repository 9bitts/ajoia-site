import Image from "next/image";
import Link from "next/link";
import { getTickerArticle } from "@/lib/articles";

export async function Ticker() {
  const article = await getTickerArticle();
  if (!article) return null;

  return (
    <div className="mx-auto max-w-content px-4 pt-5 sm:px-5">
      <Link
        href={`/artigo/${article.slug}`}
        className="group flex items-center gap-4 rounded-xl border border-[var(--line)] px-3 py-3 transition-colors hover:border-gold/50 sm:px-4"
      >
        <span className="kicker shrink-0 rounded-md border border-gold/40 px-2 py-1">
          Em destaque
        </span>
        {article.image && (
          <div className="relative hidden h-14 w-24 shrink-0 overflow-hidden rounded-md sm:block">
            <Image
              src={article.image}
              alt={article.imageAlt}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-bold tracking-tight text-[var(--text)] group-hover:text-gold sm:text-base">
            {article.title}
          </p>
          <p className="mt-0.5 truncate text-sm text-mist-muted">{article.authorName}</p>
        </div>
      </Link>
    </div>
  );
}
