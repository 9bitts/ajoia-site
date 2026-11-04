"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  SEO_DESCRIPTION_MAX,
  SEO_DESCRIPTION_MIN,
  SEO_TITLE_MAX,
  SEO_TITLE_MIN,
  publishSeoError,
} from "@/lib/seo-rules";
import { SECTIONS, sectionDefaultsToOpinion, sectionMeta } from "@/lib/sections";
import { slugify } from "@/lib/slug";

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
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  noindex: boolean;
  isOpinion: boolean;
  slug: string;
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
    const seoError = publishSeoError({
      status,
      dek: form.dek,
      imageAlt: form.imageAlt,
    });
    if (seoError) {
      setError(seoError);
      setMessage("");
      return;
    }
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
          <FieldLength
            value={form.seoTitle.trim() || form.title.trim()}
            min={SEO_TITLE_MIN}
            max={SEO_TITLE_MAX}
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
          <FieldLength
            value={form.seoDescription.trim() || form.dek.trim()}
            min={SEO_DESCRIPTION_MIN}
            max={SEO_DESCRIPTION_MAX}
          />
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
            Seção
          </span>
          <select
            value={form.section}
            onChange={(e) => {
              const section = e.target.value;
              setForm({
                ...form,
                section,
                isOpinion: sectionDefaultsToOpinion(section),
              });
            }}
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
                  alt={form.imageAlt || "Prévia da capa"}
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

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
            Descrição da imagem (alt)
          </span>
          <input
            value={form.imageAlt}
            onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
          />
          <p className="mt-2 text-xs text-mist-dim">
            Obrigatória para publicar. Se não houver foto própria, a seção usa
            uma imagem padrão — descreva o que o leitor vê.
          </p>
        </label>

        {mode === "edit" && (
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
              Endereço
            </span>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
            />
            <p className="mt-2 text-xs text-mist-dim">
              ajoiabrasil.com.br/artigo/{slugify(form.slug) || "slug"}
            </p>
            {form.status === "PUBLISHED" &&
              slugify(form.slug) !== slugify(initial.slug) && (
                <p className="mt-1 text-xs text-amber-200">
                  A URL antiga passa a redirecionar para esta. Evite mudar
                  depois de publicada.
                </p>
              )}
          </label>
        )}

        <div className="space-y-4 border border-white/10 p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
            Busca e redes
          </p>
          <label className="block">
            <span className="text-xs text-mist-muted">
              Título no Google (opcional)
            </span>
            <input
              value={form.seoTitle}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
            />
          </label>
          <label className="block">
            <span className="text-xs text-mist-muted">
              Descrição no Google (opcional)
            </span>
            <textarea
              value={form.seoDescription}
              onChange={(e) =>
                setForm({ ...form, seoDescription: e.target.value })
              }
              rows={2}
              className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50"
            />
          </label>
          <label className="flex items-start gap-2 text-sm text-mist-muted">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.isOpinion}
              onChange={(e) =>
                setForm({ ...form, isOpinion: e.target.checked })
              }
            />
            <span>
              Esta matéria é opinião. Opinião, Editorial e Tema Livre já nascem
              marcadas. O rótulo aparece na página.
            </span>
          </label>
          {isAdmin && (
            <label className="flex items-start gap-2 text-sm text-mist-muted">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.noindex}
                onChange={(e) =>
                  setForm({ ...form, noindex: e.target.checked })
                }
              />
              <span>
                Não indexar. A página continua no ar, fora do Google, do sitemap
                e do RSS.
              </span>
            </label>
          )}
          <SerpPreview
            title={form.seoTitle.trim() || form.title.trim() || "Título da matéria"}
            description={
              form.seoDescription.trim() ||
              form.dek.trim() ||
              "A linha-fina aparece aqui como descrição."
            }
            slug={
              mode === "edit"
                ? slugify(form.slug) || "slug"
                : slugify(form.title) || "endereco-gerado-do-titulo"
            }
          />
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

function FieldLength({
  value,
  min,
  max,
}: {
  value: string;
  min: number;
  max: number;
}) {
  const length = value.length;
  const outside = length > 0 && (length < min || length > max);
  return (
    <p className={`mt-2 text-xs ${outside ? "text-amber-200" : "text-mist-dim"}`}>
      {length} caracteres · ideal {min}–{max}
    </p>
  );
}

function SerpPreview({
  title,
  description,
  slug,
}: {
  title: string;
  description: string;
  slug: string;
}) {
  return (
    <div className="bg-white px-4 py-3 text-black">
      <p className="text-xs text-[#4d5156]">
        ajoiabrasil.com.br/artigo/{slug}
      </p>
      <p className="mt-1 text-lg leading-snug text-[#1a0dab]">{title}</p>
      <p className="mt-1 text-sm leading-snug text-[#4d5156]">{description}</p>
    </div>
  );
}
