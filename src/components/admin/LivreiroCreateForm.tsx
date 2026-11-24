"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LivreiroCreateForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOk("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/livraria/livreiros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        password: String(data.get("password") || ""),
      }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string; user?: { email: string } } | null;
    setLoading(false);
    if (!res.ok) {
      setError(json?.error || "Falha ao criar a conta.");
      return;
    }
    setOk(`Livreiro criado: ${json?.user?.email || "conta pronta"}. A senha será trocada no primeiro acesso.`);
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-white/10 p-6">
      <h2 className="font-display text-2xl text-white">Conta de livreiro</h2>
      <p className="text-sm text-mist-muted">
        Esta conta entra só na livraria. Não vê matérias, colunistas nem o restante do admin.
      </p>
      <input
        name="name"
        required
        placeholder="Nome"
        className="w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="E-mail"
        className="w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
      />
      <input
        name="password"
        type="password"
        required
        minLength={10}
        placeholder="Senha (mín. 10, letras e números)"
        className="w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
      />
      {error && <p className="text-sm text-red-300">{error}</p>}
      {ok && <p className="text-sm text-emerald-300">{ok}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary text-xs uppercase tracking-[0.14em] disabled:opacity-50"
      >
        {loading ? "Criando…" : "Criar livreiro"}
      </button>
    </form>
  );
}
