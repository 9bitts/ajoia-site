import Link from "next/link";
import { auth, signOut } from "@/auth";
import { BrandLogo } from "@/components/BrandLogo";

export async function AdminNav() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <header className="border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-3">
            <BrandLogo href="/admin" size="sm" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-mist-dim">
              Admin
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.16em] text-mist-muted">
            <Link href="/admin" className="hover:text-white">
              {session.user.role === "ADMIN" ? "Colunistas" : "Minhas matérias"}
            </Link>
            <Link href="/admin/artigos/novo" className="hover:text-white">
              Nova matéria
            </Link>
            {session.user.role === "ADMIN" && (
              <>
                <Link href="/admin/usuarios" className="hover:text-white">
                  Contas
                </Link>
                <Link href="/admin/mensagens" className="hover:text-white">
                  Caixa
                </Link>
              </>
            )}
            <Link href="/" className="hover:text-white" target="_blank">
              Ver site
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-mist-muted">
          <span className="hidden sm:inline">{session.user.name}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="border border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-mist hover:border-mist/40 hover:text-white"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
