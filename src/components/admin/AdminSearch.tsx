export function AdminSearch({
  action,
  defaultValue,
  placeholder,
}: {
  action: string;
  defaultValue?: string;
  placeholder: string;
}) {
  return (
    <form action={action} className="flex flex-wrap gap-2">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-w-[16rem] flex-1 border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white outline-none placeholder:text-mist-dim focus:border-gold/60"
      />
      <button
        type="submit"
        className="border border-white/20 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-white hover:border-gold/60"
      >
        Buscar
      </button>
      {defaultValue ? (
        <a
          href={action}
          className="px-3 py-2.5 text-[11px] uppercase tracking-[0.14em] text-mist-dim hover:text-white"
        >
          Limpar
        </a>
      ) : null}
    </form>
  );
}

const statuses = [
  { id: "", label: "Todas" },
  { id: "PUBLISHED", label: "Publicadas" },
  { id: "PENDING", label: "Na fila" },
  { id: "DRAFT", label: "Rascunhos" },
] as const;

export function StatusFilters({
  base,
  current,
  q,
}: {
  base: string;
  current: string;
  q: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (status.id) params.set("status", status.id);
        const href = params.size ? `${base}?${params}` : base;
        const active = current === status.id;
        return (
          <a
            key={status.id || "all"}
            href={href}
            className={
              active
                ? "border border-gold/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-gold"
                : "border border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-mist-muted hover:text-white"
            }
          >
            {status.label}
          </a>
        );
      })}
    </div>
  );
}
