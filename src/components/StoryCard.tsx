import Image from "next/image";
import Link from "next/link";
import type { PublicArticle } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { sectionMeta } from "@/lib/sections";

type Props = {
  article: PublicArticle;
  size?: "sm" | "md" | "lg";
  showDek?: boolean;
  variant?: "media" | "row" | "line";
};

export function StoryCard({
  article,
  size = "md",
  showDek = false,
  variant = "media",
}: Props) {
  const section = sectionMeta[article.section];
  const image = article.image;

  if (variant === "line") {
    return (
      <Link
        href={`/artigo/${article.slug}`}
        className="group block py-3.5"
      >
        <p className="kicker">{section.label}</p>
        <h3 className="mt-1 font-sans text-[15px] font-semibold leading-snug tracking-tight text-[var(--text)] transition-colors group-hover:text-gold">
          {article.title}
        </h3>
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <article>
        <Link href={`/artigo/${article.slug}`} className="group flex gap-4 py-4">
          <div className="relative h-[78px] w-[112px] shrink-0 overflow-hidden rounded-md bg-[var(--bg-soft)]">
            {image && (
              <Image
                src={image}
                alt=""
                fill
                sizes="112px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="kicker">{section.label}</p>
            <h3 className="mt-1 font-sans text-base font-semibold leading-snug tracking-tight text-[var(--text)] transition-colors group-hover:text-gold">
              {article.title}
            </h3>
            <p className="mt-1 text-xs text-mist-dim">
              {article.authorName} · {formatDate(article.date)}
            </p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group">
      <Link href={`/artigo/${article.slug}`} className="block">
        <div
          className={`relative overflow-hidden rounded-xl bg-[var(--bg-soft)] ${
            size === "lg" ? "aspect-[16/10]" : "aspect-[16/10]"
          }`}
        >
          {image && (
            <Image
              src={image}
              alt=""
              fill
              sizes={
                size === "lg"
                  ? "(max-width: 1024px) 100vw, 50vw"
                  : "(max-width: 768px) 100vw, 33vw"
              }
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}
        </div>
        <p className="kicker mt-3">{section.label}</p>
        <h3
          className={`mt-1 font-sans font-bold leading-snug tracking-tight text-[var(--text)] transition-colors group-hover:text-gold ${
            size === "lg"
              ? "text-2xl md:text-[1.7rem]"
              : size === "sm"
                ? "text-lg"
                : "text-xl"
          }`}
        >
          {article.title}
        </h3>
        <p className="mt-2 text-xs text-mist-dim">
          {article.authorName} · {formatDate(article.date)}
        </p>
        {showDek && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-mist-muted">
            {article.dek}
          </p>
        )}
      </Link>
    </article>
  );
}
