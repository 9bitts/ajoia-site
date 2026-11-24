"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const field =
  "w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50";

export function StoreStockForm({ id, stock }: { id: string; stock: number }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOk("");
    const data = new FormData(event.currentTarget);
    const res = await fetch(`/api/livraria/itens/${id}/estoque`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stock: String(data.get("stock") || ""),
        note: String(data.get("note") || ""),
      }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string; item?: { stock: number } } | null;
    setLoading(false);
    if (!res.ok) {
      setError(json?.error || "Não foi possível ajustar o estoque.");
      return;
    }
    setOk(`Estoque atualizado para ${json?.item?.stock ?? ""}.`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-white/10 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">Estoque</p>
      <p className="text-sm text-mist-muted">
        Saldo atual: <span className="text-white">{stock}</span>. O ajuste fica na auditoria. A venda ainda não baixa sozinha.
      </p>
      <label className="block text-sm text-mist-muted">
        Novo saldo
        <input name="stock" type="number" min={0} required defaultValue={stock} className={`${field} mt-2`} />
      </label>
      <label className="block text-sm text-mist-muted">
        Nota
        <input name="note" placeholder="Entrada, correção, perda…" className={`${field} mt-2`} />
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {ok && <p className="text-sm text-emerald-300">{ok}</p>}
      <button type="submit" disabled={loading} className="btn-primary text-xs uppercase tracking-[0.14em] disabled:opacity-50">
        {loading ? "Ajustando…" : "Ajustar estoque"}
      </button>
    </form>
  );
}
