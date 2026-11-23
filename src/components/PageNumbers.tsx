import Link from "next/link";

type Props = {
  page: number;
  pages: number;
  path: string;
};

function hrefFor(path: string, page: number) {
  return page <= 1 ? path : `${path}?page=${page}`;
}

export function PageNumbers({ page, pages, path }: Props) {
  if (pages <= 1) return null;
  const end = Math.min(pages, Math.max(page + 2, 5));
  const start = Math.max(1, end - 4);
  const items: number[] = [];
  for (let number = start; number <= end; number += 1) items.push(number);

  const itemClass = (current: boolean) =>
    current
      ? "inline-flex h-11 min-w-11 items-center justify-center border border-gold px-2 text-sm font-bold text-gold"
      : "inline-flex h-11 min-w-11 items-center justify-center border border-[var(--line)] px-2 text-sm text-[var(--text)] hover:border-gold/60";

  return (
    <nav aria-label="Páginas" className="mt-10 flex flex-wrap items-center gap-2">
      {page > 1 && (
        <Link href={hrefFor(path, page - 1)} className={itemClass(false)}>
          Anterior
        </Link>
      )}
      {start > 1 && (
        <Link href={hrefFor(path, 1)} className={itemClass(page === 1)}>
          1
        </Link>
      )}
      {start > 2 && <span className="px-1 text-mist-dim">…</span>}
      {items.map((number) => (
        <Link
          key={number}
          href={hrefFor(path, number)}
          aria-current={number === page ? "page" : undefined}
          className={itemClass(number === page)}
        >
          {number}
        </Link>
      ))}
      {end < pages - 1 && <span className="px-1 text-mist-dim">…</span>}
      {end < pages && (
        <Link href={hrefFor(path, pages)} className={itemClass(page === pages)}>
          {pages}
        </Link>
      )}
      {page < pages && (
        <Link href={hrefFor(path, page + 1)} className={itemClass(false)}>
          Próxima
        </Link>
      )}
    </nav>
  );
}
