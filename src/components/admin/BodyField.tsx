"use client";

import { useRef, useState } from "react";
import { youtubeEmbedUrl } from "@/lib/youtube";
import { IMAGE_MAX_LABEL, VIDEO_MAX_LABEL, fileTooLargeMessage } from "@/lib/upload-limits";
import { uploadMedia } from "@/lib/upload-client";
import { MediaBrowser, type MediaAsset } from "@/components/admin/MediaBrowser";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function figure(url: string, caption: string) {
  const alt = caption || "Imagem da matéria";
  const cap = caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "";
  return `\n<figure><img src="${url}" alt="${escapeHtml(alt)}" />${cap}</figure>\n`;
}

function videoTag(url: string) {
  return `\n<video src="${url}" controls preload="metadata"></video>\n`;
}

function isVideo(url: string) {
  return /\.(mp4|webm)$/i.test(url);
}

export function BodyField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [caption, setCaption] = useState("");
  const [youtube, setYoutube] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [library, setLibrary] = useState(false);

  function insert(html: string) {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    onChange(`${value.slice(0, start)}${html}${value.slice(end)}`);
    requestAnimationFrame(() => {
      const cursor = start + html.length;
      el?.focus();
      el?.setSelectionRange(cursor, cursor);
    });
  }

  async function onPhotos(list: FileList | null) {
    if (!list?.length) return;
    const files = Array.from(list);
    const tooLarge = files.map((file) => fileTooLargeMessage(file)).find(Boolean);
    if (tooLarge) {
      setError(`${tooLarge} O texto da matéria não foi alterado.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const blocks: string[] = [];
      for (const file of files) {
        const url = await uploadMedia(file);
        blocks.push(figure(url, files.length === 1 ? caption.trim() : ""));
      }
      insert(blocks.join(""));
      setCaption("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erro no upload";
      setError(`${message} O texto da matéria não foi alterado.`);
    } finally {
      setBusy(false);
    }
  }

  async function onVideoFile(file: File | undefined) {
    if (!file) return;
    const tooLarge = fileTooLargeMessage(file);
    if (tooLarge) {
      setError(`${tooLarge} O texto da matéria não foi alterado.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      insert(videoTag(await uploadMedia(file)));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erro no upload";
      setError(`${message} O texto da matéria não foi alterado.`);
    } finally {
      setBusy(false);
    }
  }

  function onYoutube() {
    const src = youtubeEmbedUrl(youtube);
    if (!src) {
      setError("Cole um link do YouTube.");
      return;
    }
    setError("");
    insert(
      `\n<iframe src="${src}" title="Vídeo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>\n`
    );
    setYoutube("");
  }

  function useAsset(asset: MediaAsset) {
    insert(isVideo(asset.url) ? videoTag(asset.url) : figure(asset.url, caption.trim()));
    setCaption("");
    setLibrary(false);
  }

  return (
    <div>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          Texto
        </span>
        <textarea
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={14}
          className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 font-serif text-base leading-relaxed text-white outline-none focus:border-mist/50"
        />
      </label>
      <div className="mt-3 space-y-3 border border-white/10 p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          No meio do texto
        </p>
        <p className="text-xs text-mist-dim">
          A foto ou o vídeo entra onde estiver o cursor. Foto até {IMAGE_MAX_LABEL}.
          Vídeo enviado até {VIDEO_MAX_LABEL}; um vídeo maior entra pelo link do
          YouTube. Várias fotos de uma vez ficam sem legenda; para legenda, envie
          uma por vez.
        </p>
        <input
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Legenda da foto (opcional)"
          className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-mist/50"
        />
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center border border-white/20 px-3 text-[11px] uppercase tracking-[0.14em] text-mist hover:text-white">
            Inserir foto
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={busy}
              className="sr-only"
              onChange={(event) => {
                void onPhotos(event.target.files);
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
            Foto da biblioteca
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={youtube}
            onChange={(event) => setYoutube(event.target.value)}
            placeholder="Link do YouTube"
            className="min-w-[16rem] flex-1 border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-mist/50"
          />
          <button
            type="button"
            onClick={onYoutube}
            className="inline-flex min-h-11 items-center border border-white/20 px-3 text-[11px] uppercase tracking-[0.14em] text-mist hover:text-white"
          >
            Inserir vídeo
          </button>
          <label className="inline-flex min-h-11 cursor-pointer items-center border border-white/20 px-3 text-[11px] uppercase tracking-[0.14em] text-mist hover:text-white">
            Enviar vídeo
            <input
              type="file"
              accept="video/mp4,video/webm"
              disabled={busy}
              className="sr-only"
              onChange={(event) => {
                void onVideoFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        {busy && <p className="text-xs text-mist-dim">Enviando…</p>}
        {error && (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        )}
      </div>
      {library && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 sm:p-8">
          <div className="mx-auto max-w-5xl border border-white/15 bg-[#0c0c0e] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-display text-2xl text-white">Biblioteca</p>
              <button
                type="button"
                onClick={() => setLibrary(false)}
                className="text-xs uppercase tracking-[0.14em] text-mist-dim hover:text-white"
              >
                Fechar
              </button>
            </div>
            <MediaBrowser onPick={useAsset} />
          </div>
        </div>
      )}
    </div>
  );
}
