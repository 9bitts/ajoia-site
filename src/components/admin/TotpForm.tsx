"use client";

import { signOut } from "next-auth/react";
import { FormEvent, useState } from "react";

export function TotpForm({ enabled }: { enabled: boolean }) {
  const [secret, setSecret] = useState("");
  const [otpauth, setOtpauth] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/account/totp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start" }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error || "Não foi possível gerar a chave");
      return;
    }
    setSecret(json.secret || "");
    setOtpauth(json.otpauth || "");
  }

  async function confirm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/account/totp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "confirm",
        code: String(fd.get("code") || ""),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error || "Código inválido");
      return;
    }
    setSecret("");
    setOtpauth("");
    setMessage("Segundo fator ligado. No próximo login o código será pedido.");
  }

  async function disable(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/account/totp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "disable",
        code: String(fd.get("code") || ""),
        password: String(fd.get("password") || ""),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error || "Não foi possível desligar");
      return;
    }
    await signOut({ callbackUrl: "/admin/login" });
  }

  return (
    <div className="max-w-xl space-y-6">
      <p className="text-sm text-mist-muted">
        {enabled
          ? "O segundo fator está ligado. O login do admin pede senha e código."
          : "O segundo fator ainda está desligado. Gere a chave e confirme com um código do aplicativo."}
      </p>
      {!enabled && !secret && (
        <button
          type="button"
          disabled={loading}
          onClick={() => void start()}
          className="btn-primary text-xs uppercase tracking-[0.14em] disabled:opacity-50"
        >
          {loading ? "Gerando…" : "Gerar chave"}
        </button>
      )}
      {secret && (
        <form onSubmit={confirm} className="space-y-4 border border-white/10 p-6">
          <p className="text-sm text-mist-muted">
            No aplicativo autenticador, escolha entrada manual e use esta chave. Ela aparece só agora.
          </p>
          <p className="break-all font-mono text-sm text-white">{secret}</p>
          <p className="break-all text-xs text-mist-dim">{otpauth}</p>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">Código</span>
            <input
              name="code"
              inputMode="numeric"
              required
              className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-xs uppercase tracking-[0.14em] disabled:opacity-50"
          >
            Confirmar
          </button>
        </form>
      )}
      {enabled && (
        <form onSubmit={disable} className="space-y-4 border border-white/10 p-6">
          <p className="text-sm text-mist-muted">
            Desligar o segundo fator pede a senha e um código atual. As sessões abertas caem.
          </p>
          <input
            name="password"
            type="password"
            required
            placeholder="Senha"
            className="w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
          />
          <input
            name="code"
            inputMode="numeric"
            required
            placeholder="Código"
            className="w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.14em] text-mist"
          >
            Desligar
          </button>
        </form>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {message && <p className="text-sm text-emerald-300">{message}</p>}
    </div>
  );
}
