"use client";

import Image from "next/image";
import { useState } from "react";

type Slide = { url: string; caption: string };

export function ArticleGallery({ items }: { items: Slide[] }) {
  const [index, setIndex] = useState(0);
  if (!items.length) return null;
  const item = items[index] ?? items[0];
  const many = items.length > 1;

  function step(direction: -1 | 1) {
    setIndex((current) => (current + direction + items.length) % items.length);
  }

  return (
    <figure className="mt-10">
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-[var(--bg-soft)]">
        <Image
          src={item.url}
          alt={item.caption || "Foto da galeria"}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
        {many && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-2xl text-white hover:bg-black"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-2xl text-white hover:bg-black"
            >
              ›
            </button>
          </>
        )}
      </div>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-3 text-sm text-mist-dim">
        <span>{item.caption}</span>
        {many && (
          <span className="text-xs uppercase tracking-[0.14em]">
            {index + 1} / {items.length}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
