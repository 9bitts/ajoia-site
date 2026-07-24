import Image from "next/image";
import Link from "next/link";
import type { PublicArticle } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { sectionMeta } from "@/lib/sections";

type Props = {
  article: PublicArticle;
  size?: "sm" | "md" | "lg";
  showDek?: boolean;
};

export function StoryCard({ article, size = "md", showDek = false }: Props) {
  const section = sectionMeta[article.section];
  const image = article.image;

  return (
    <article className="group">
      <Link href={`/artigo/${article.slug}`} className="block">
        <div
          className={`story-media relative mb-4 overflow-hidden bg-ink-soft ${
            size === "lg"
              ? "aspect-[16/10]"
              : size === "sm"
                ? "aspect-[16/11]"
                : "aspect-[16/10]"
          }`}
        >
          {image && (
            <Image
              src={image}
              alt=""
              fill
              sizes={
                size === "lg"
                  ? "(max-width: 1024px) 100vw, 60vw"
                  : "(max-width: 768px) 100vw, 33vw"
              }
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}
          <div className="on-media absolute bottom-0 left-0 right-0 z-10 p-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white drop-shadow">
              {section.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          <span className="min-w-0 truncate">{article.authorName}</span>
          <span className="shrink-0 text-mist-dim/50">·</span>
          <time className="shrink-0" dateTime={article.date}>
            {formatDate(article.date)}
          </time>
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
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mist-muted">
            {article.dek}
          </p>
        )}
      </Link>
    </article>
  );
}
