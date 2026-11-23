"use client";

import { useEffect, useState } from "react";

export type MediaAsset = {
  id: string;
  url: string;
  alt: string;
  createdAt: string;
};

function isVideo(url: string) {
  return /\.(mp4|webm)$/i.test(url);
}

export function MediaBrowser({
  onPick,
  allowDelete = false,
}: {
  onPick?: (asset: MediaAsset) => void;
  allowDelete?: boolean;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(query = q) {
    setLoading(true);
    setError("");
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    const res = await fetch(`/api/media${params}`);
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error || "Não foi possível abrir a biblioteca");
      return;
    }
    setAssets(json.assets || []);
  }

  useEffect(() => {
    void load("");
    // primeira carga
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove(asset: MediaAsset) {
    const probe = await fetch(`/api/media/${asset.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const json = await probe.json().catch(() => ({}));
    if (!probe.ok && probe.status !== 409) {
      setError(json.error || "Não foi possível apagar");
      return;
    }
    const articles = (json.usages?.articles || []).map((item: { title: string }) => item.title);
    const people = (json.usages?.users || []).map((item: { name: string }) => item.name);
    const where = [...articles, ...people];
    const message = where.length
      ? `Esta imagem ainda está em uso:\n${where.join("\n")}\n\nApagar mesmo assim? As matérias que a usam ficam sem esse arquivo.`
      : "Apagar esta imagem da biblioteca?";
    if (!confirm(message)) return;
    const confirmed = await fetch(`/api/media/${asset.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    if (!confirmed.ok) {
      const body = await confirmed.json().catch(() => ({}));
      setError(body.error || "Não foi possível apagar");
      return;
    }
    setAssets((current) => current.filter((item) => item.id !== asset.id));
  }

  return (
    <div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void load(q);
        }}
      >
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Buscar por nome do arquivo"
          className="min-h-11 w-full min-w-0 flex-1 border border-white/15 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-gold/60 sm:min-w-[16rem]"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center border border-white/20 px-4 text-[11px] uppercase tracking-[0.14em] text-white"
        >
          Buscar
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm text-mist-dim">Carregando imagens…</p>
      ) : assets.length === 0 ? (
        <p className="mt-6 text-sm text-mist-muted">Nenhuma imagem encontrada.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <li key={asset.id} className="border border-white/10 bg-black/30">
              <button
                type="button"
                onClick={() => onPick?.(asset)}
                className="block w-full text-left"
                disabled={!onPick}
              >
                <div className="relative aspect-[4/3] bg-black/50">
                  {isVideo(asset.url) ? (
                    <video src={asset.url} className="h-full w-full object-cover" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.url} alt={asset.alt || ""} className="h-full w-full object-cover" />
                  )}
                </div>
              </button>
              <div className="space-y-2 p-2">
                <p className="truncate text-[11px] text-mist-dim">
                  {asset.url.split("/").pop()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {onPick && (
                    <button
                      type="button"
                      onClick={() => onPick(asset)}
                      className="text-[11px] uppercase tracking-[0.12em] text-gold"
                    >
                      Usar
                    </button>
                  )}
                  {allowDelete && (
                    <button
                      type="button"
                      onClick={() => void remove(asset)}
                      className="text-[11px] uppercase tracking-[0.12em] text-red-300"
                    >
                      Apagar
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
