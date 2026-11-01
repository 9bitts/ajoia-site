"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SECTIONS, sectionMeta } from "@/lib/sections";

type ArticleStatusValue = "DRAFT" | "PENDING" | "PUBLISHED";

type ArticleFormValues = {
  title: string;
  dek: string;
  body: string;
  section: string;
  status: ArticleStatusValue;
  featured: boolean;
  breaking: boolean;
  imageUrl: string | null;
};

type Props = {
  mode: "create" | "edit";
  articleId?: string;
  initial: ArticleFormValues;
  isAdmin?: boolean;
  accountApproved?: boolean;
  author?: { name: string; email: string; approved: boolean } | null;
};

export function ArticleForm({
  mode,
  articleId,
  initial,
  isAdmin,
  accountApproved = true,
  author,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function onUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no upload");
      setForm((f) => ({ ...f, imageUrl: json.url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(status: ArticleStatusValue) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = { ...form, status };
      const url =
        mode === "create" ? "/api/articles" : `/api/articles/${articleId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao salvar");
      setForm((f) => ({ ...f, status }));
      setMessage(
        status === "PUBLISHED"
          ? "Publicado no site."
          : status === "PENDING"
            ? "Enviado para avaliação. A matéria só entra no ar quando a administração publicar."
            : "Rascunho salvo."
      );
      if (mode === "create") {
        router.push(`/admin/artigos/${json.article.id}`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!articleId || !confirm("Excluir este artigo?")) return;
    const res = await fetch(`/api/articles/${articleId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    }
  }

  const statusLabel =
    form.status === "PUBLISHED"
      ? "Publicado"
      : form.status === "PENDING"
        ? "Aguardando avaliação"
        : "Rascunho";

  return (
    <div className="space-y-6">
      <p className="text-sm text-mist-muted">
        Situação:{" "}
        <span
          className={
            form.status === "PUBLISHED"
              ? "text-emerald-300"
              : form.status === "PENDING"
                ? "text-amber-200"
                : "text-mist"
          }
        >
          {statusLabel}
        </span>
        {isAdmin && author && (
          <>
            {" "}
            · Autor: {author.name} ({author.email})
            {author.approved ? "" : " — conta ainda não liberada"}
          </>
        )}
      </p>
      {!isAdmin && !accountApproved && (
        <p className="border border-amber-200/30 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
          Sua conta ainda não foi liberada. Você pode escrever e salvar
          rascunhos. O envio para publicação fica disponível depois que a
          administração autorizar seu acesso.
        </p>
      )}
      {!isAdmin && accountApproved && (
        <p className="text-sm text-mist-muted">
          Enviar para avaliação coloca o texto na fila do administrador. Ele
          lê e só então clica em publicar.
        </p>
      )}
      {!isAdmin && form.status === "PUBLISHED" && (
        <p className="text-sm text-amber-100">
          Esta matéria está no ar. Salvar rascunho ou reenviar para avaliação
          tira o texto do site até a administração publicar de novo.
        </p>
      )}
      <div className="grid gap-5">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
            Título
          </span>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
          />
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
            Linha fina (dek)
          </span>
          <textarea
            value={form.dek}
            onChange={(e) => setForm({ ...form, dek: e.target.value })}
            rows={2}
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
          />
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
            Seção
          </span>
          <select
            value={form.section}
            onChange={(e) => setForm({ ...form, section: e.target.value })}
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
          >
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {sectionMeta[s].label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
            Texto (parágrafos separados por linha em branco)
          </span>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={14}
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 font-serif text-base leading-relaxed text-white outline-none focus:border-mist/50"
          />
        </label>

        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
            Imagem de capa
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative aspect-[16/10] w-full max-w-md overflow-hidden border border-white/10 bg-ink-soft">
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-mist-dim">
                  Sem imagem
                </div>
              )}
            </div>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onUpload(file);
                }}
                className="block w-full text-sm text-mist-muted file:mr-3 file:border-0 file:bg-mist file:px-3 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-ink"
              />
              {uploading && (
                <p className="text-xs text-mist-dim">Enviando imagem…</p>
              )}
              {form.imageUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: null })}
                  className="text-xs uppercase tracking-[0.14em] text-mist-dim hover:text-white"
                >
                  Remover imagem
                </button>
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-mist-muted">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
              />
              Destaque na capa
            </label>
            <label className="flex items-center gap-2 text-sm text-mist-muted">
              <input
                type="checkbox"
                checked={form.breaking}
                onChange={(e) =>
                  setForm({ ...form, breaking: e.target.checked })
                }
              />
              Em destaque (selo)
            </label>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}
      {message && <p className="text-sm text-emerald-300">{message}</p>}

      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
        <button
          type="button"
          disabled={saving}
          onClick={() => void onSubmit("DRAFT")}
          className="border border-white/20 px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-mist hover:border-mist/50 hover:text-white disabled:opacity-50"
        >
          Salvar rascunho
        </button>
        {isAdmin ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => void onSubmit("PUBLISHED")}
            className="btn-primary text-xs uppercase tracking-[0.14em] disabled:opacity-50"
          >
            Publicar
          </button>
        ) : (
          <button
            type="button"
            disabled={saving || !accountApproved}
            onClick={() => void onSubmit("PENDING")}
            className="btn-primary text-xs uppercase tracking-[0.14em] disabled:opacity-50"
          >
            Enviar para avaliação
          </button>
        )}
        {mode === "edit" && (isAdmin || form.status !== "PUBLISHED") && (
          <button
            type="button"
            onClick={() => void onDelete()}
            className="ml-auto text-xs uppercase tracking-[0.14em] text-red-300/80 hover:text-red-200"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}
