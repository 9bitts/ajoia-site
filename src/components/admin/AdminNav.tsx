import Link from "next/link";
import { auth, signOut } from "@/auth";
import { BrandLogo } from "@/components/BrandLogo";

export async function AdminNav() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <header className="border-b border-white/10 bg-ink/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-3">
            <BrandLogo href="/" size="sm" native />
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center text-[10px] uppercase tracking-[0.18em] text-mist-dim hover:text-white"
            >
              Admin
            </Link>
          </div>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-[0.16em] text-mist-muted">
            <Link href="/admin" className="inline-flex min-h-11 items-center hover:text-white">
              {session.user.role === "ADMIN" ? "Colunistas" : "Minhas matérias"}
            </Link>
            <Link href="/admin/artigos/novo" className="inline-flex min-h-11 items-center hover:text-white">
              Nova matéria
            </Link>
            <Link href="/admin/senha" className="inline-flex min-h-11 items-center hover:text-white">
              Senha
            </Link>
            {session.user.role === "ADMIN" && (
              <>
                <Link href="/admin/usuarios" className="inline-flex min-h-11 items-center hover:text-white">
                  Contas
                </Link>
                <Link href="/admin/mensagens" className="inline-flex min-h-11 items-center hover:text-white">
                  Caixa
                </Link>
                <Link href="/admin/redes" className="inline-flex min-h-11 items-center hover:text-white">
                  Redes
                </Link>
                <Link href="/admin/seguranca" className="inline-flex min-h-11 items-center hover:text-white">
                  Segurança
                </Link>
                <Link href="/admin/auditoria" className="inline-flex min-h-11 items-center hover:text-white">
                  Auditoria
                </Link>
              </>
            )}
            <Link href="/" className="inline-flex min-h-11 items-center hover:text-white">
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
              className="inline-flex min-h-11 items-center border border-white/15 px-3 text-[11px] uppercase tracking-[0.14em] text-mist hover:border-mist/40 hover:text-white"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
