"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadMedia } from "@/lib/upload-client";
import { bookBindings, storeKinds, storeStatuses } from "@/lib/store-input";
import { bindingLabel, centsToInput, kindLabel, statusLabel } from "@/lib/store-format";

const field =
  "w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-mist/50";

export type StoreItemFormValue = {
  id?: string;
  kind: string;
  name: string;
  slug: string;
  synopsis: string;
  description: string;
  priceCents: number;
  coverUrl: string | null;
  coverAlt: string;
  status: string;
  featured: boolean;
  weightGrams: number;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  isbn13: string | null;
  authors: string;
  publisher: string;
  edition: string;
  year: number | null;
  pages: number | null;
  language: string;
  binding: string | null;
  categoryId: string | null;
};

type CategoryOption = { id: string; name: string };

export function StoreItemForm({
  initial,
  categories,
}: {
  initial?: StoreItemFormValue;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState(initial?.kind || "LIVRO");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function onCover(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      setCoverUrl(await uploadMedia(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no envio da capa.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const payload = {
      kind,
      name: String(data.get("name") || ""),
      slug: String(data.get("slug") || ""),
      synopsis: String(data.get("synopsis") || ""),
      description: String(data.get("description") || ""),
      price: String(data.get("price") || ""),
      stock: initial ? undefined : String(data.get("stock") || "0"),
      coverUrl: coverUrl || null,
      coverAlt: String(data.get("coverAlt") || ""),
      status: String(data.get("status") || "DRAFT"),
      featured: data.get("featured") === "on",
      weightGrams: String(data.get("weightGrams") || "0"),
      widthCm: String(data.get("widthCm") || "0"),
      heightCm: String(data.get("heightCm") || "0"),
      depthCm: String(data.get("depthCm") || "0"),
      categoryId: String(data.get("categoryId") || ""),
      isbn13: String(data.get("isbn13") || ""),
      authors: String(data.get("authors") || ""),
      publisher: String(data.get("publisher") || ""),
      edition: String(data.get("edition") || ""),
      year: String(data.get("year") || ""),
      pages: String(data.get("pages") || ""),
      language: String(data.get("language") || ""),
      binding: String(data.get("binding") || ""),
    };

    const res = await fetch(initial?.id ? `/api/livraria/itens/${initial.id}` : "/api/livraria/itens", {
      method: initial?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => null)) as { error?: string; item?: { id: string } } | null;
    setLoading(false);
    if (!res.ok || !json?.item) {
      setError(json?.error || "Não foi possível salvar.");
      return;
    }
    router.push(`/admin/livraria/itens/${json.item.id}`);
    router.refresh();
  }

  async function onDelete() {
    if (!initial?.id) return;
    if (!window.confirm("Apagar este item da livraria?")) return;
    setLoading(true);
    const res = await fetch(`/api/livraria/itens/${initial.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error || "Não foi possível apagar.");
      return;
    }
    router.push("/admin/livraria");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-mist-muted">
          Tipo
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value)}
            className={`${field} mt-2`}
          >
            {storeKinds.map((value) => (
              <option key={value} value={value}>
                {kindLabel[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-mist-muted">
          Situação
          <select name="status" defaultValue={initial?.status || "DRAFT"} className={`${field} mt-2`}>
            {storeStatuses.map((value) => (
              <option key={value} value={value}>
                {statusLabel[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm text-mist-muted">
        Nome
        <input name="name" required defaultValue={initial?.name || ""} className={`${field} mt-2`} />
      </label>
      <label className="block text-sm text-mist-muted">
        Endereço (opcional)
        <input
          name="slug"
          defaultValue={initial?.slug || ""}
          placeholder="deixa em branco para gerar a partir do nome"
          className={`${field} mt-2`}
        />
      </label>
      <label className="block text-sm text-mist-muted">
        Sinopse curta
        <textarea name="synopsis" rows={2} defaultValue={initial?.synopsis || ""} className={`${field} mt-2`} />
      </label>
      <label className="block text-sm text-mist-muted">
        Descrição
        <textarea name="description" rows={6} defaultValue={initial?.description || ""} className={`${field} mt-2`} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-mist-muted">
          Preço (R$)
          <input
            name="price"
            required
            inputMode="decimal"
            defaultValue={initial ? centsToInput(initial.priceCents) : ""}
            placeholder="49,90"
            className={`${field} mt-2`}
          />
        </label>
        <label className="block text-sm text-mist-muted">
          Categoria
          <select name="categoryId" defaultValue={initial?.categoryId || ""} className={`${field} mt-2`}>
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!initial && (
        <label className="block text-sm text-mist-muted">
          Estoque inicial
          <input name="stock" type="number" min={0} defaultValue={0} className={`${field} mt-2`} />
        </label>
      )}

      <label className="flex items-center gap-2 text-sm text-mist-muted">
        <input type="checkbox" name="featured" defaultChecked={initial?.featured || false} />
        Destacar na vitrine
      </label>

      <div className="space-y-3 border border-white/10 p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">Capa</p>
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="h-40 w-28 object-cover" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(event) => onCover(event.target.files?.[0])}
          className="text-sm text-mist-muted"
        />
        <label className="block text-sm text-mist-muted">
          Texto alternativo
          <input name="coverAlt" defaultValue={initial?.coverAlt || ""} className={`${field} mt-2`} />
        </label>
        {coverUrl && (
          <button type="button" onClick={() => setCoverUrl("")} className="text-xs uppercase tracking-[0.14em] text-mist-dim hover:text-white">
            Remover capa
          </button>
        )}
        {uploading && <p className="text-sm text-mist-muted">Enviando capa…</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm text-mist-muted">
          Peso (g)
          <input name="weightGrams" type="number" min={0} defaultValue={initial?.weightGrams || 0} className={`${field} mt-2`} />
        </label>
        <label className="block text-sm text-mist-muted">
          Largura (cm)
          <input name="widthCm" type="number" min={0} defaultValue={initial?.widthCm || 0} className={`${field} mt-2`} />
        </label>
        <label className="block text-sm text-mist-muted">
          Altura (cm)
          <input name="heightCm" type="number" min={0} defaultValue={initial?.heightCm || 0} className={`${field} mt-2`} />
        </label>
        <label className="block text-sm text-mist-muted">
          Profundidade (cm)
          <input name="depthCm" type="number" min={0} defaultValue={initial?.depthCm || 0} className={`${field} mt-2`} />
        </label>
      </div>
      <p className="text-xs text-mist-dim">Peso e medidas ficam guardados para o frete, que entra junto com o pagamento.</p>

      {kind === "LIVRO" && (
        <div className="space-y-4 border border-white/10 p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">Ficha do livro</p>
          <label className="block text-sm text-mist-muted">
            ISBN-13
            <input name="isbn13" required defaultValue={initial?.isbn13 || ""} placeholder="9786550000000" className={`${field} mt-2`} />
          </label>
          <label className="block text-sm text-mist-muted">
            Autores
            <input name="authors" required defaultValue={initial?.authors || ""} className={`${field} mt-2`} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-mist-muted">
              Editora
              <input name="publisher" defaultValue={initial?.publisher || ""} className={`${field} mt-2`} />
            </label>
            <label className="block text-sm text-mist-muted">
              Edição
              <input name="edition" defaultValue={initial?.edition || ""} className={`${field} mt-2`} />
            </label>
            <label className="block text-sm text-mist-muted">
              Ano
              <input name="year" type="number" defaultValue={initial?.year ?? ""} className={`${field} mt-2`} />
            </label>
            <label className="block text-sm text-mist-muted">
              Páginas
              <input name="pages" type="number" defaultValue={initial?.pages ?? ""} className={`${field} mt-2`} />
            </label>
            <label className="block text-sm text-mist-muted">
              Idioma
              <input name="language" defaultValue={initial?.language || "Português"} className={`${field} mt-2`} />
            </label>
            <label className="block text-sm text-mist-muted">
              Capa
              <select name="binding" defaultValue={initial?.binding || ""} className={`${field} mt-2`}>
                <option value="">Não informado</option>
                {bookBindings.map((value) => (
                  <option key={value} value={value}>
                    {bindingLabel[value]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading || uploading} className="btn-primary text-xs uppercase tracking-[0.14em] disabled:opacity-50">
          {loading ? "Salvando…" : "Salvar"}
        </button>
        {initial?.id && (
          <button type="button" onClick={onDelete} disabled={loading} className="btn-ghost text-xs uppercase tracking-[0.14em]">
            Apagar
          </button>
        )}
      </div>
    </form>
  );
}
