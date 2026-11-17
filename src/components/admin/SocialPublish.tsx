"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { weightedLength } from "@/lib/social/copy";

type Network = "FACEBOOK" | "INSTAGRAM" | "X";

type LastPost = {
  ok: boolean;
  url: string | null;
  error: string | null;
  at: string;
};

type Card = {
  connected: boolean;
  accountName: string | null;
  text: string;
  limit: number;
  last: LastPost | null;
};

type Payload = {
  published: boolean;
  url?: string;
  ai?: boolean;
  image?: "missing" | "local" | "public";
  networks?: Record<Network, Card>;
};

const ORDER: { id: Network; label: string; hint: string }[] = [
  {
    id: "FACEBOOK",
    label: "Facebook",
    hint: "O texto vai na publicação. O link da matéria abre o cartão da página.",
  },
  {
    id: "INSTAGRAM",
    label: "Instagram",
    hint: "Legenda e a foto de capa. Sem foto, o Instagram não publica.",
  },
  {
    id: "X",
    label: "X",
    hint: "Um post curto. O link da matéria entra no fim e conta no limite.",
  },
];

function when(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function SocialPublish({
  articleId,
  published,
}: {
  articleId: string;
  published: boolean;
}) {
  const [data, setData] = useState<Payload | null>(null);
  const [texts, setTexts] = useState<Record<Network, string>>({
    FACEBOOK: "",
    INSTAGRAM: "",
    X: "",
  });
  const [loading, setLoading] = useState(published);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Partial<Record<Network, string>>>({});
  const [fails, setFails] = useState<Partial<Record<Network, string>>>({});

  useEffect(() => {
    if (!published) return;
    let cancel = false;
    (async () => {
      try {
        const res = await fetch(`/api/social/articles/${articleId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Falha ao carregar");
        if (cancel) return;
        setData(json);
        if (json.networks) {
          setTexts({
            FACEBOOK: json.networks.FACEBOOK.text,
            INSTAGRAM: json.networks.INSTAGRAM.text,
            X: json.networks.X.text,
          });
        }
      } catch (error) {
        if (!cancel) setLoadError(error instanceof Error ? error.message : "Falha ao carregar");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [articleId, published]);

  async function remodel(network: Network) {
    setBusy(`ai-${network}`);
    setNotes((n) => ({ ...n, [network]: "" }));
    setFails((n) => ({ ...n, [network]: "" }));
    try {
      const res = await fetch("/api/social/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, network }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "A IA não respondeu");
      setTexts((current) => ({ ...current, [network]: json.text }));
      setNotes((n) => ({ ...n, [network]: json.note || "Texto ajustado. Leia antes de publicar." }));
    } catch (error) {
      setFails((n) => ({
        ...n,
        [network]: error instanceof Error ? error.message : "A IA não respondeu",
      }));
    } finally {
      setBusy(null);
    }
  }

  async function publish(network: Network, confirm = false) {
    setBusy(network);
    setNotes((n) => ({ ...n, [network]: "" }));
    setFails((n) => ({ ...n, [network]: "" }));
    try {
      const res = await fetch("/api/social/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          network,
          text: texts[network],
          confirm,
        }),
      });
      const json = await res.json();
      if (res.status === 409 && json.needsConfirm) {
        const again = window.confirm(
          "Esta matéria já foi publicada nessa rede. Publicar outra vez?"
        );
        if (again) await publish(network, true);
        return;
      }
      if (!res.ok) throw new Error(json.error || "Não publicou");
      if (typeof json.text === "string") {
        setTexts((current) => ({ ...current, [network]: json.text }));
      }
      setNotes((n) => ({ ...n, [network]: "Publicado." }));
      setData((current) => {
        if (!current?.networks) return current;
        return {
          ...current,
          networks: {
            ...current.networks,
            [network]: {
              ...current.networks[network],
              last: {
                ok: true,
                url: json.url || null,
                error: null,
                at: new Date().toISOString(),
              },
            },
          },
        };
      });
    } catch (error) {
      setFails((n) => ({
        ...n,
        [network]: error instanceof Error ? error.message : "Não publicou",
      }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section id="redes" className="scroll-mt-8 border border-white/10 p-5">
      <h2 className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">Redes</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-muted">
        Um clique publica o texto desta caixa. Ajustar com IA reescreve para a rede, sem inventar fato. O que sai é o texto que está no ar, não um rascunho ainda não salvo.
      </p>
      {!published && (
        <p className="mt-4 text-sm text-amber-100">
          Publique a matéria no site. Os botões do Facebook, do Instagram e do X ficam disponíveis em seguida.
        </p>
      )}
      {loading && <p className="mt-4 text-sm text-mist-dim">Preparando os textos…</p>}
      {loadError && <p className="mt-4 text-sm text-red-300">{loadError}</p>}
      {data?.networks && (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {ORDER.map((item) => {
            const card = data.networks?.[item.id];
            if (!card) return null;
            const locked = busy !== null;
            const count = item.id === "X" ? weightedLength(texts[item.id]) : texts[item.id].length;
            const max = item.id === "X" ? 280 : card.limit;
            const over = count > max;
            return (
              <div key={item.id} className="flex flex-col border border-white/10 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl text-white">{item.label}</h3>
                  <span className={card.connected ? "text-xs text-emerald-300" : "text-xs text-mist-dim"}>
                    {card.connected ? card.accountName || "conectado" : "não conectado"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-mist-dim">{item.hint}</p>
                {item.id === "INSTAGRAM" && data.image === "missing" && (
                  <p className="mt-2 text-xs text-amber-200">Esta matéria está sem foto de capa.</p>
                )}
                {item.id === "INSTAGRAM" && data.image === "local" && (
                  <p className="mt-2 text-xs text-amber-200">
                    O Instagram só recebe a foto quando o site está em https.
                  </p>
                )}
                <label className="mt-3 block flex-1">
                  <span className="sr-only">Texto para {item.label}</span>
                  <textarea
                    value={texts[item.id]}
                    onChange={(event) =>
                      setTexts((current) => ({ ...current, [item.id]: event.target.value }))
                    }
                    rows={item.id === "X" ? 6 : 10}
                    maxLength={item.id === "X" ? 500 : 2200}
                    className="h-full min-h-40 w-full border border-white/15 bg-black/40 px-3 py-3 text-sm leading-relaxed text-white outline-none focus:border-mist/50"
                  />
                </label>
                <p className={`mt-2 text-xs ${over ? "text-amber-200" : "text-mist-dim"}`}>
                  {count} / {max}
                  {item.id === "X" ? " com o link contando 23" : ""}
                  {item.id === "FACEBOOK" && data.url ? (
                    <span className="mt-1 block break-all font-normal text-mist-dim">
                      Cartão: {data.url}
                    </span>
                  ) : null}
                </p>
                {card.last?.ok && (
                  <p className="mt-2 text-xs text-emerald-300">
                    No ar desde {when(card.last.at)}
                    {card.last.url ? (
                      <>
                        {" "}
                        <a href={card.last.url} target="_blank" rel="noreferrer" className="underline">
                          abrir
                        </a>
                      </>
                    ) : null}
                  </p>
                )}
                {card.last && !card.last.ok && card.last.error && (
                  <p className="mt-2 text-xs text-red-300">{card.last.error}</p>
                )}
                {notes[item.id] && <p className="mt-2 text-xs text-emerald-300">{notes[item.id]}</p>}
                {fails[item.id] && <p className="mt-2 text-xs text-red-300">{fails[item.id]}</p>}
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => void remodel(item.id)}
                    className="border border-white/20 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-mist hover:border-mist/50 hover:text-white disabled:opacity-50"
                  >
                    {busy === `ai-${item.id}` ? "Ajustando…" : "Ajustar com IA"}
                  </button>
                  {card.connected ? (
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => void publish(item.id)}
                      className="btn-primary text-xs uppercase tracking-[0.14em] disabled:opacity-50"
                    >
                      {busy === item.id ? "Publicando…" : `Publicar no ${item.label}`}
                    </button>
                  ) : (
                    <Link
                      href="/admin/redes"
                      className="btn-primary text-xs uppercase tracking-[0.14em]"
                    >
                      Conectar em Redes
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
