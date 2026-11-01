"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function RegisterForm() {
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOk("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        password: String(fd.get("password") || ""),
        bio: String(fd.get("bio") || ""),
        roleLabel: String(fd.get("roleLabel") || "Jornalista"),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error || "Não foi possível criar a conta");
      return;
    }
    setOk(json.message);
    e.currentTarget.reset();
  }

  if (ok) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-emerald-300">{ok}</p>
        <Link
          href="/admin/login"
          className="btn-primary inline-block text-xs uppercase tracking-[0.14em]"
        >
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          Nome
        </span>
        <input
          name="name"
          required
          minLength={2}
          className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          E-mail
        </span>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          Senha
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          Função
        </span>
        <input
          name="roleLabel"
          defaultValue="Jornalista"
          className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          Bio
        </span>
        <textarea
          name="bio"
          rows={3}
          className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
        />
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full text-xs uppercase tracking-[0.14em] disabled:opacity-50"
      >
        {loading ? "Criando…" : "Criar conta"}
      </button>
    </form>
  );
}
