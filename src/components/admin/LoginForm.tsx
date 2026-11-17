"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { safeCallbackUrl } from "@/lib/callback-url";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsCode, setNeedsCode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      code,
      redirect: false,
    });
    setLoading(false);
    if (res?.code === "totp_required" || res?.code === "totp_invalid") {
      setNeedsCode(true);
      setError(
        res.code === "totp_invalid"
          ? "Código inválido."
          : "Digite o código do autenticador."
      );
      return;
    }
    if (res?.status === 429 || res?.code === "rate_limited") {
      setError("Muitas tentativas. Espere alguns minutos.");
      return;
    }
    if (res?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          E-mail
        </span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          Senha
        </span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
        />
      </label>
      {needsCode && (
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
            Código do autenticador
          </span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
          />
        </label>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full text-xs uppercase tracking-[0.14em] disabled:opacity-50"
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-center text-sm text-mist-muted">
        Jornalista novo?{" "}
        <Link href="/admin/cadastro" className="text-mist hover:text-white">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
