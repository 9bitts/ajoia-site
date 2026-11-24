"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const field =
  "w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  items: number;
};

export function StoreCategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/livraria/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name") || ""),
        description: String(data.get("description") || ""),
      }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setLoading(false);
    if (!res.ok) {
      setError(json?.error || "Não foi possível criar a categoria.");
      return;
    }
    form.reset();
    router.refresh();
  }

  async function save(category: Category, form: HTMLFormElement) {
    setError("");
    const data = new FormData(form);
    const res = await fetch(`/api/livraria/categorias/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name") || ""),
        description: String(data.get("description") || ""),
      }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setError(json?.error || "Não foi possível salvar a categoria.");
      return;
    }
    router.refresh();
  }

  async function remove(category: Category) {
    if (!window.confirm(`Apagar “${category.name}”? Os itens ficam sem categoria.`)) return;
    setError("");
    const res = await fetch(`/api/livraria/categorias/${category.id}`, { method: "DELETE" });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setError(json?.error || "Não foi possível apagar.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={create} className="grid gap-4 border border-white/10 p-6 md:grid-cols-2">
        <label className="block text-sm text-mist-muted md:col-span-2">
          Nova categoria
          <input name="name" required placeholder="Jornalismo, Ensaios, Papelaria…" className={`${field} mt-2`} />
        </label>
        <label className="block text-sm text-mist-muted md:col-span-2">
          Descrição
          <input name="description" className={`${field} mt-2`} />
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-fit text-xs uppercase tracking-[0.14em] disabled:opacity-50">
          {loading ? "Salvando…" : "Adicionar"}
        </button>
      </form>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <ul className="space-y-4">
        {categories.map((category) => (
          <li key={category.id} className="border border-white/10 p-4">
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void save(category, event.currentTarget);
              }}
            >
              <input name="name" defaultValue={category.name} required className={field} />
              <input name="description" defaultValue={category.description} className={field} />
              <p className="text-xs text-mist-dim">
                /livraria/c/{category.slug} · {category.items} {category.items === 1 ? "item" : "itens"}
              </p>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="text-xs uppercase tracking-[0.14em] text-white hover:text-mist">
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => remove(category)}
                  className="text-xs uppercase tracking-[0.14em] text-mist-dim hover:text-white"
                >
                  Apagar
                </button>
              </div>
            </form>
          </li>
        ))}
      </ul>
      {categories.length === 0 && (
        <p className="text-sm text-mist-muted">Nenhuma categoria ainda. A vitrine continua no ar sem elas.</p>
      )}
    </div>
  );
}
