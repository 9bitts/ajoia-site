"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PageChoice = { id: string; name: string; instagram: string | null };

type Props = {
  facebook: { name: string } | null;
  instagram: { name: string } | null;
  x: { name: string } | null;
  metaReady: boolean;
  xReady: boolean;
  ai: boolean;
  pages: PageChoice[];
};

export function SocialAccounts({ facebook, instagram, x, metaReady, xReady, ai, pages }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [pageId, setPageId] = useState(pages[0]?.id || "");

  async function connect(path: string) {
    setBusy(path);
    setError("");
    try {
      const res = await fetch(path, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Não foi possível abrir a autorização");
      window.location.href = json.url;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao conectar");
      setBusy("");
    }
  }

  async function disconnect(target: "META" | "X") {
    const label = target === "X" ? "o X" : "o Facebook e o Instagram";
    if (!window.confirm(`Desconectar ${label}? As matérias deixam de poder ser publicadas por aqui até uma nova autorização.`)) {
      return;
    }
    setBusy(target);
    setError("");
    try {
      const res = await fetch("/api/social/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não desconectou");
      router.replace("/admin/redes");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não desconectou");
    } finally {
      setBusy("");
    }
  }

  async function choosePage() {
    if (!pageId) return;
    setBusy("page");
    setError("");
    try {
      const res = await fetch("/api/social/meta/page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não foi possível guardar a Página");
      router.replace(json.instagram ? "/admin/redes?ok=meta_ig" : "/admin/redes?ok=meta");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível guardar a Página");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-6">
      {pages.length > 0 && (
        <div className="border border-white/10 p-4">
          <p className="text-sm text-white">Qual Página da Ajoia recebe as matérias?</p>
          <div className="mt-3 space-y-2">
            {pages.map((page) => (
              <label key={page.id} className="flex items-start gap-2 text-sm text-mist-muted">
                <input
                  type="radio"
                  name="meta-page"
                  value={page.id}
                  checked={pageId === page.id}
                  onChange={() => setPageId(page.id)}
                  className="mt-1"
                />
                <span>
                  {page.name}
                  <span className="block text-xs text-mist-dim">
                    {page.instagram ? `Instagram @${page.instagram}` : "Sem Instagram profissional"}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={busy === "page"}
            onClick={() => void choosePage()}
            className="btn-primary mt-4 text-xs uppercase tracking-[0.14em] disabled:opacity-50"
          >
            {busy === "page" ? "Guardando…" : "Usar esta Página"}
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <AccountCard
          title="Facebook"
          connected={Boolean(facebook)}
          detail={facebook ? facebook.name : "Não conectado"}
          ready={metaReady}
          missing="Falta META_APP_ID e META_APP_SECRET no servidor."
          action={facebook ? "Desconectar" : "Conectar Facebook e Instagram"}
          busy={busy === (facebook ? "META" : "/api/social/meta/start")}
          onClick={() => void (facebook ? disconnect("META") : connect("/api/social/meta/start"))}
        />
        <AccountCard
          title="Instagram"
          connected={Boolean(instagram)}
          detail={
            instagram
              ? `@${instagram.name}`
              : facebook
                ? "Página sem conta profissional vinculada"
                : "Entra junto com o Facebook"
          }
          ready={metaReady}
          missing="Conecte pela autorização do Facebook."
          action={instagram ? "Desconectar" : ""}
          busy={busy === "META"}
          onClick={instagram ? () => void disconnect("META") : undefined}
        />
        <AccountCard
          title="X"
          connected={Boolean(x)}
          detail={x ? `@${x.name}` : "Não conectado"}
          ready={xReady}
          missing="Falta X_CLIENT_ID e X_CLIENT_SECRET no servidor."
          action={x ? "Desconectar" : "Conectar X"}
          busy={busy === (x ? "X" : "/api/social/x/start")}
          onClick={() => void (x ? disconnect("X") : connect("/api/social/x/start"))}
        />
      </div>
      <p className="text-sm text-mist-muted">
        {ai
          ? "A IA está configurada. Em cada matéria, Ajustar com IA reescreve o texto daquela rede."
          : "Sem chave de IA, cada rede recebe um recorte editorial. O botão de IA avisa até SOCIAL_AI_API_KEY existir no servidor."}
      </p>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}

function AccountCard({
  title,
  connected,
  detail,
  ready,
  missing,
  action,
  busy,
  onClick,
}: {
  title: string;
  connected: boolean;
  detail: string;
  ready: boolean;
  missing: string;
  action: string;
  busy: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="border border-white/10 p-4">
      <h2 className="font-display text-2xl text-white">{title}</h2>
      <p className={`mt-2 text-sm ${connected ? "text-emerald-300" : "text-mist-muted"}`}>{detail}</p>
      {!ready && !connected && <p className="mt-2 text-xs text-amber-200">{missing}</p>}
      {action && onClick && (
        <button
          type="button"
          disabled={busy || (!connected && !ready)}
          onClick={onClick}
          className={
            connected
              ? "mt-4 border border-white/20 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-mist hover:text-white disabled:opacity-50"
              : "btn-primary mt-4 text-xs uppercase tracking-[0.14em] disabled:opacity-50"
          }
        >
          {busy ? "Aguarde…" : action}
        </button>
      )}
    </div>
  );
}
