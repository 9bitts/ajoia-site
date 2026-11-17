"use client";

import { signOut } from "next-auth/react";
import { FormEvent, useState } from "react";

export function PasswordForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: String(fd.get("currentPassword") || ""),
        newPassword: String(fd.get("newPassword") || ""),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error || "Não foi possível trocar a senha");
      return;
    }
    await signOut({ callbackUrl: "/admin/login" });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-5 border border-white/10 p-6">
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">Senha atual</span>
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">Nova senha</span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
        />
        <span className="mt-2 block text-xs text-mist-dim">
          Mínimo de 10 caracteres, com letras e números. Depois da troca, entre de novo.
        </span>
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary text-xs uppercase tracking-[0.14em] disabled:opacity-50"
      >
        {loading ? "Salvando…" : "Trocar senha"}
      </button>
    </form>
  );
}
