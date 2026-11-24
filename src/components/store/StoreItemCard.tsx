import Image from "next/image";
import Link from "next/link";
import type { StoreCategory, StoreItem } from "@prisma/client";
import { formatCents, kindLabel, stockLabel } from "@/lib/store-format";

export type CardItem = StoreItem & {
  category: Pick<StoreCategory, "slug" | "name"> | null;
};

export function StoreItemCard({ item }: { item: CardItem }) {
  return (
    <Link href={`/livraria/p/${item.slug}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden bg-[var(--bg-soft)]">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={item.coverAlt || item.name}
            fill
            sizes="(min-width: 1024px) 240px, 45vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-end p-4">
            <p className="font-display text-2xl leading-tight text-[var(--text)]">{item.name}</p>
          </div>
        )}
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-mist-dim">
        {item.kind === "LIVRO" ? item.authors || kindLabel.LIVRO : kindLabel.OUTRO}
      </p>
      <h2 className="mt-1 font-display text-2xl leading-tight text-[var(--text)] transition-colors group-hover:text-gold">
        {item.name}
      </h2>
      <p className="mt-2 text-sm text-[var(--text)]">{formatCents(item.priceCents)}</p>
      <p className="mt-1 text-xs text-mist-muted">{stockLabel(item.stock)}</p>
    </Link>
  );
}
