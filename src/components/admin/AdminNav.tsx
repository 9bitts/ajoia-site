import Link from "next/link";
import { auth, signOut } from "@/auth";
import { BrandLogo } from "@/components/BrandLogo";

export async function AdminNav() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <header className="border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <BrandLogo href="/admin" size="sm" />
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-mist-dim sm:inline">
              Admin
            </span>
          </div>
          <nav className="hidden items-center gap-4 text-xs uppercase tracking-[0.16em] text-mist-muted sm:flex">
            <Link href="/admin" className="hover:text-white">
              Artigos
            </Link>
            <Link href="/admin/artigos/novo" className="hover:text-white">
              Novo
            </Link>
            {session.user.role === "ADMIN" && (
              <Link href="/admin/usuarios" className="hover:text-white">
                Usuários
              </Link>
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
