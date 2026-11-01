"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function UserCreateForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOk("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      bio: String(fd.get("bio") || ""),
      roleLabel: String(fd.get("roleLabel") || "Colunista"),
      featured: fd.get("featured") === "on",
    };
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error || "Falha ao criar");
      return;
    }
    setOk(`Colunista criado: ${json.user.email}`);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-white/10 p-6">
      <h2 className="font-display text-2xl text-white">Novo jornalista</h2>
      <p className="text-sm text-mist-muted">
        Conta criada por aqui já nasce liberada. Quem se cadastra sozinho
        precisa da sua autorização.
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
        minLength={8}
        placeholder="Senha (mín. 8)"
        className="w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
      />
      <input
        name="roleLabel"
        placeholder="Função (ex.: Opinião)"
        defaultValue="Colunista"
        className="w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
      />
      <textarea
        name="bio"
        rows={3}
        placeholder="Bio"
        className="w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
      />
      <label className="flex items-center gap-2 text-sm text-mist-muted">
        <input type="checkbox" name="featured" />
        Destacar na capa (colunistas)
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {ok && <p className="text-sm text-emerald-300">{ok}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary text-xs uppercase tracking-[0.14em] disabled:opacity-50"
      >
        {loading ? "Criando…" : "Criar conta"}
      </button>
    </form>
  );
}
