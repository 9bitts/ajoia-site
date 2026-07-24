import Link from "next/link";
import type { Article } from "@/data/articles";
import { sectionMeta } from "@/data/articles";
import { formatDate } from "@/lib/format";

type Props = {
  article: Article;
  size?: "sm" | "md" | "lg";
  showDek?: boolean;
};

export function StoryCard({ article, size = "md", showDek = false }: Props) {
  const section = sectionMeta[article.section];

  return (
    <article className="group">
      <Link href={`/artigo/${article.slug}`} className="block">
        <div
          className={`story-media mb-4 bg-gradient-to-br ${article.imageGradient} ${
            size === "lg" ? "aspect-[16/10]" : size === "sm" ? "aspect-[16/11]" : "aspect-[16/10]"
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_45%)]" />
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-mist">
              {section.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          <span>{article.authorName}</span>
          <span className="text-white/20">·</span>
          <time dateTime={article.date}>{formatDate(article.date)}</time>
        </div>
        <h3
          className={`mt-2 font-display leading-tight text-white transition-colors group-hover:text-mist ${
            size === "lg"
              ? "text-2xl md:text-3xl"
              : size === "sm"
                ? "text-lg"
                : "text-xl md:text-[1.35rem]"
          }`}
        >
          {article.title}
        </h3>
        {showDek && (
          <p className="mt-3 text-sm leading-relaxed text-mist-muted line-clamp-3">
            {article.dek}
          </p>
        )}
      </Link>
    </article>
  );
}
