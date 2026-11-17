"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  slug: string;
  roleLabel: string;
  approved: boolean;
  active: boolean;
  createdLabel: string;
};

export function UserAccessRow({
  user,
  showArticles = true,
}: {
  user: UserRow;
  showArticles?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");

  async function setApproved(approved: boolean) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error || "Não foi possível atualizar");
      return;
    }
    router.refresh();
  }

  async function resetPassword() {
    if (!confirm(`Gerar uma senha nova para ${user.name}? A sessão atual dessa pessoa cai.`)) {
      return;
    }
    setLoading(true);
    setError("");
    setTemporaryPassword("");
    const res = await fetch(`/api/users/${user.id}/password`, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error || "Não foi possível redefinir a senha");
      return;
    }
    setTemporaryPassword(json.temporaryPassword || "");
  }

  const open = user.active && user.approved;

  return (
    <li className="border border-white/10 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg text-white">{user.name}</p>
          <p className="text-mist-muted">{user.email}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-mist-dim">
            {user.roleLabel} · /{user.slug} · desde {user.createdLabel}
          </p>
          <p className={open ? "mt-2 text-xs text-emerald-300" : "mt-2 text-xs text-amber-200"}>
            {open
              ? "Conta liberada — pode entrar e enviar matérias para avaliação"
              : "Sem acesso — o login não abre até a liberação"}
          </p>
          {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
          {temporaryPassword && (
            <p className="mt-2 text-xs text-amber-100">
              Senha temporária, visível só agora:{" "}
              <span className="font-mono text-white">{temporaryPassword}</span>.
              A pessoa troca no primeiro acesso. Não envie por e-mail.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {showArticles && (
            <a
              href={`/admin/colunistas/${user.slug}`}
              className="border border-white/20 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-white hover:border-gold/60"
            >
              Matérias
            </a>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => void resetPassword()}
            className="border border-white/20 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-mist hover:border-mist/50 hover:text-white disabled:opacity-50"
          >
            Nova senha
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void setApproved(!open)}
            className="border border-white/20 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-mist hover:border-mist/50 hover:text-white disabled:opacity-50"
          >
            {loading ? "Salvando…" : open ? "Suspender" : "Liberar"}
          </button>
        </div>
      </div>
    </li>
  );
}
