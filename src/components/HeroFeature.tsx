import Image from "next/image";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { sidebarAds } from "@/data/ads";
import type { PublicArticle } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { sectionMeta } from "@/lib/sections";
import { StoryCard } from "./StoryCard";

type Props = {
  lead: PublicArticle;
  side: PublicArticle[];
  latest: PublicArticle[];
};

export function HeroFeature({ lead, side, latest }: Props) {
  const section = sectionMeta[lead.section];
  const shown = side.slice(0, 2);
  const exclude = new Set([lead.slug, ...shown.map((item) => item.slug)]);
  const rail = latest.filter((item) => !exclude.has(item.slug)).slice(0, 7);

  return (
    <section className="mx-auto grid max-w-content gap-8 px-4 pt-6 sm:px-5 lg:grid-cols-12 lg:pt-8">
      <div className="min-w-0 lg:col-span-8">
        <Link href={`/artigo/${lead.slug}`} className="group block">
          <div className="relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-2xl bg-[#1a1a1d] sm:min-h-[440px] lg:min-h-[520px]">
            {lead.image && (
              <Image
                src={lead.image}
                alt={lead.imageAlt}
                fill
                priority
                unoptimized={lead.image.startsWith("/uploads/")}
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
            <div className="on-dark relative z-10 p-5 sm:p-7 md:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e8c56b]">
                {section.label}
                {lead.breaking ? " · Em destaque" : ""}
              </p>
              <h1 className="mt-2 max-w-3xl font-sans text-[1.7rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-3xl md:text-[2.65rem]">
                {lead.title}
              </h1>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
                {lead.authorName} · {formatDate(lead.date)}
              </p>
            </div>
          </div>
        </Link>

        {side.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {shown.map((article) => (
              <StoryCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </div>

      <aside className="lg:col-span-4">
        <div className="rounded-2xl bg-[var(--bg-soft)] p-5 sm:p-6 lg:sticky lg:top-28">
          <h2 className="font-sans text-lg font-bold tracking-tight text-[var(--text)]">
            Últimas notícias
          </h2>
          <div className="mt-2 divide-y divide-[var(--line)]">
            {rail.map((article) => (
              <StoryCard key={article.slug} article={article} variant="line" />
            ))}
          </div>
          <Link
            href="/ultimas"
            className="mt-4 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-gold"
          >
            Ver todas →
          </Link>
        </div>
        {sidebarAds[0] && (
          <div className="mt-6">
            <AdSlot ad={sidebarAds[0]} showLabel />
          </div>
        )}
      </aside>
    </section>
  );
}
