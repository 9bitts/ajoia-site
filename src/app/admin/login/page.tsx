import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { accountId } from "@/lib/account-id";
import { BrandLogo } from "@/components/BrandLogo";
import { LoginForm } from "@/components/admin/LoginForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function AdminLoginPage() {
  const session = await auth();
  if (accountId(session)) redirect("/admin");

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="flex items-start justify-between gap-4">
        <BrandLogo href="/" size="lg" priority />
        <ThemeToggle className="inline-flex min-h-11 items-center text-[11px] tracking-[0.14em] text-mist-dim" />
      </div>
      <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-mist-dim">
        Redação
      </p>
      <h1 className="mt-2 font-display text-4xl text-white">Entrar</h1>
      <p className="mt-3 text-sm text-mist-muted">
        Área restrita para colunistas e administração da Ajoia.
      </p>
      <div className="mt-8 border border-white/10 bg-ink-elevated/40 p-6">
        <Suspense fallback={<p className="text-mist-dim">Carregando…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
