"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnistAvatar } from "@/components/ColumnistAvatar";
import { uploadMedia } from "@/lib/upload-client";

type Props = {
  userId: string;
  name: string;
  bio: string;
  roleLabel: string;
  avatarUrl: string | null;
  canEditRole?: boolean;
};

export function ColumnistProfileForm({
  userId,
  name,
  bio,
  roleLabel,
  avatarUrl,
  canEditRole = false,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ bio, roleLabel, avatarUrl });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadMedia(file);
      setForm((current) => ({ ...current, avatarUrl: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  async function onSave() {
    setSaving(true);
    setError("");
    setMessage("");
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: form.bio,
        avatarUrl: form.avatarUrl,
        ...(canEditRole ? { roleLabel: form.roleLabel } : {}),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(json.error || "Não foi possível salvar");
      return;
    }
    setMessage("Foto e bio salvas.");
    router.refresh();
  }

  return (
    <div className="border border-white/10 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
        Foto e bio no site
      </p>
      <div className="mt-4 flex flex-wrap items-start gap-4">
        <ColumnistAvatar name={name} avatarUrl={form.avatarUrl} />
        <div className="space-y-2">
          <label className="inline-flex min-h-11 cursor-pointer items-center border border-white/20 px-3 text-[11px] uppercase tracking-[0.14em] text-mist hover:text-white">
            {uploading ? "Enviando…" : "Enviar foto"}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              className="sr-only"
              onChange={(event) => {
                void onPhoto(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          {form.avatarUrl && (
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, avatarUrl: null }))}
              className="block text-[11px] uppercase tracking-[0.14em] text-mist-dim hover:text-white"
            >
              Remover foto
            </button>
          )}
        </div>
      </div>
      {canEditRole && (
        <label className="mt-4 block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
            Função
          </span>
          <input
            value={form.roleLabel}
            onChange={(event) => setForm({ ...form, roleLabel: event.target.value })}
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none"
          />
        </label>
      )}
      <label className="mt-4 block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          Bio
        </span>
        <textarea
          value={form.bio}
          onChange={(event) => setForm({ ...form, bio: event.target.value })}
          rows={4}
          className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-white outline-none"
        />
      </label>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      {message && <p className="mt-3 text-sm text-emerald-300">{message}</p>}
      <button
        type="button"
        disabled={saving || uploading}
        onClick={() => void onSave()}
        className="btn-primary mt-4 text-xs uppercase tracking-[0.14em] disabled:opacity-50"
      >
        {saving ? "Salvando…" : "Salvar perfil"}
      </button>
    </div>
  );
}
