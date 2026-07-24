import Image from "next/image";
import Link from "next/link";
import type { PublicArticle } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { sectionMeta } from "@/lib/sections";

type Props = {
  lead: PublicArticle;
  side: PublicArticle[];
};

export function HeroFeature({ lead, side }: Props) {
  const section = sectionMeta[lead.section];
  const image = lead.image;

  return (
    <section className="mx-auto grid max-w-content gap-8 px-4 pt-8 sm:px-5 sm:pt-10 lg:grid-cols-12 lg:gap-10 lg:pt-14">
      <div className="animate-fade-up min-w-0 lg:col-span-8">
        <Link href={`/artigo/${lead.slug}`} className="group block">
          <div className="relative flex min-h-[340px] flex-col justify-end overflow-hidden bg-ink-soft sm:min-h-[420px] md:min-h-[520px]">
            {image && (
              <Image
                src={image}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
            <div className="on-media relative z-10 p-5 pt-14 sm:p-6 sm:pt-16 md:p-10 md:pt-24">
              {lead.breaking && (
                <span className="mb-4 inline-flex items-center border border-white/40 bg-black/50 px-3 py-1.5 text-[10px] leading-none tracking-[0.22em] text-white uppercase">
                  Em destaque
                </span>
              )}
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/75">
                {section.label} · {formatDate(lead.date)}
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-[1.75rem] leading-[1.08] text-white transition-colors group-hover:text-white/90 sm:text-3xl md:text-5xl lg:text-[3.25rem]">
                {lead.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
                {lead.dek}
              </p>
              <p className="mt-5 text-xs uppercase tracking-[0.18em] text-white/65">
                Por {lead.authorName}
              </p>
            </div>
          </div>
        </Link>
      </div>

      <aside className="animate-fade-up-delay-1 flex flex-col gap-6 lg:col-span-4">
        <div className="flex items-end justify-between border-b border-white/10 pb-3">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-mist-soft">
            Nesta edição
          </h2>
          <Link href="/ultimas" className="btn-ghost text-[10px]">
            Ver todas →
          </Link>
        </div>
        {side.map((article, index) => (
          <Link
            key={article.slug}
            href={`/artigo/${article.slug}`}
            className={`group border-b border-white/5 pb-5 last:border-0 ${
              index === 0 ? "animate-fade-up-delay-1" : "animate-fade-up-delay-2"
            }`}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-mist-dim">
              {sectionMeta[article.section].label} · {formatDate(article.date)}
            </p>
            <h3 className="mt-2 font-display text-xl leading-snug text-white transition-colors group-hover:text-mist">
              {article.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-mist-muted">
              {article.dek}
            </p>
          </Link>
        ))}
      </aside>
    </section>
  );
}
