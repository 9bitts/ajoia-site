"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addToCart, cartCount, readCart } from "@/lib/store-cart";

export function AddToCartButton({ slug, stock }: { slug: string; stock: number }) {
  const [added, setAdded] = useState(false);

  if (stock < 1) {
    return (
      <button type="button" disabled className="btn-primary cursor-not-allowed text-xs uppercase tracking-[0.14em] opacity-50">
        Esgotado
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        className="btn-primary text-xs uppercase tracking-[0.14em]"
        onClick={() => {
          addToCart(slug);
          setAdded(true);
        }}
      >
        Adicionar à sacola
      </button>
      {added && (
        <Link href="/livraria/sacola" className="text-sm text-mist-muted hover:text-[var(--text)]">
          Ver sacola
        </Link>
      )}
    </div>
  );
}

export function SacolaLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(cartCount(readCart()));
    sync();
    window.addEventListener("ajoia-sacola", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ajoia-sacola", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Link href="/livraria/sacola" className="text-[11px] uppercase tracking-[0.16em] text-mist-dim hover:text-[var(--text)]">
      Sacola{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
