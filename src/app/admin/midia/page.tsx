import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MediaBrowser } from "@/components/admin/MediaBrowser";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN") redirect("/admin");

  return (
    <div>
      <Link
        href="/admin"
        className="text-[11px] uppercase tracking-[0.16em] text-mist-dim hover:text-white"
      >
        ← Painel
      </Link>
      <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-mist-dim">
        Arquivo
      </p>
      <h1 className="mt-2 font-display text-4xl text-white">Biblioteca de imagens</h1>
      <p className="mt-2 max-w-xl text-sm text-mist-muted">
        Fotos e vídeos enviados pela redação e os que já aparecem nas matérias.
        Apagar um arquivo que ainda está em uso pede confirmação.
      </p>
      <div className="mt-8">
        <MediaBrowser allowDelete />
      </div>
    </div>
  );
}
