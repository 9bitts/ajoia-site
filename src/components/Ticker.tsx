import Link from "next/link";
import { getLatestArticles } from "@/data/articles";

export function Ticker() {
  const items = getLatestArticles(8);
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-white/10 bg-ink-elevated/80">
      <div className="mx-auto flex max-w-content items-stretch">
        <div className="flex shrink-0 items-center bg-gradient-to-r from-mist/20 to-transparent px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-mist">
          Ao vivo
        </div>
        <div className="relative flex-1 overflow-hidden py-3">
          <div className="ticker-track gap-10 px-4">
            {loop.map((article, i) => (
              <Link
                key={`${article.slug}-${i}`}
                href={`/artigo/${article.slug}`}
                className="whitespace-nowrap text-sm text-mist-muted transition-colors hover:text-white"
              >
                <span className="mr-3 text-mist-dim">◆</span>
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
