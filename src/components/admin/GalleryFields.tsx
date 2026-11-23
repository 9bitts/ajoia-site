"use client";

import { useState } from "react";
import type { GalleryItem } from "@/lib/gallery";
import { MediaBrowser, type MediaAsset } from "@/components/admin/MediaBrowser";

async function uploadFile(file: File) {
  const data = new FormData();
  data.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: data });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Falha no upload");
  return String(json.url || "");
}

export function GalleryFields({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [library, setLibrary] = useState(false);

  function update(next: GalleryItem[]) {
    onChange(next);
  }

  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    setError("");
    try {
      const added: GalleryItem[] = [];
      for (const file of Array.from(list)) {
        added.push({ url: await uploadFile(file), caption: "" });
      }
      update([...items, ...added].slice(0, 40));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setBusy(false);
    }
  }

  function addAsset(asset: MediaAsset) {
    if (/\.(mp4|webm)$/i.test(asset.url)) {
      setError("A galeria aceita fotos. O vídeo entra no meio do texto.");
      return;
    }
    update([...items, { url: asset.url, caption: "" }].slice(0, 40));
    setLibrary(false);
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    update(copy);
  }

  return (
    <div className="space-y-3 border border-white/10 p-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          Galeria no final da matéria
        </p>
        <p className="mt-2 text-xs text-mist-dim">
          Estas fotos ficam sempre depois do texto, com seta para ir e voltar.
          Cada uma pode ter a própria legenda.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="inline-flex min-h-11 cursor-pointer items-center border border-white/20 px-3 text-[11px] uppercase tracking-[0.14em] text-mist hover:text-white">
          Adicionar fotos
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            className="sr-only"
            onChange={(event) => {
              void addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => setLibrary(true)}
          className="inline-flex min-h-11 items-center border border-white/20 px-3 text-[11px] uppercase tracking-[0.14em] text-mist hover:text-white"
        >
          Da biblioteca
        </button>
      </div>
      {busy && <p className="text-xs text-mist-dim">Enviando…</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={`${item.url}-${index}`} className="flex gap-3 border border-white/10 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" className="h-16 w-24 object-cover" />
            <div className="min-w-0 flex-1 space-y-2">
              <input
                value={item.caption}
                onChange={(event) => {
                  const copy = [...items];
                  copy[index] = { ...item, caption: event.target.value };
                  update(copy);
                }}
                placeholder="Legenda"
                className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none"
              />
              <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.12em]">
                <button type="button" onClick={() => move(index, -1)} className="text-mist-dim hover:text-white">
                  Subir
                </button>
                <button type="button" onClick={() => move(index, 1)} className="text-mist-dim hover:text-white">
                  Descer
                </button>
                <button
                  type="button"
                  onClick={() => update(items.filter((_, i) => i !== index))}
                  className="text-red-300"
                >
                  Remover
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {library && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 sm:p-8">
          <div className="mx-auto max-w-5xl border border-white/15 bg-[#0c0c0e] p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-2xl text-white">Biblioteca</p>
              <button
                type="button"
                onClick={() => setLibrary(false)}
                className="text-xs uppercase tracking-[0.14em] text-mist-dim hover:text-white"
              >
                Fechar
              </button>
            </div>
            <MediaBrowser onPick={addAsset} />
          </div>
        </div>
      )}
    </div>
  );
}
