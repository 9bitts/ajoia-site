import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { RegisterForm } from "@/components/admin/RegisterForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="flex items-start justify-between gap-4">
        <BrandLogo href="/" size="lg" priority />
        <ThemeToggle className="inline-flex min-h-11 items-center text-[11px] tracking-[0.14em] text-mist-dim" />
      </div>
      <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-mist-dim">
        Redação
      </p>
      <h1 className="mt-2 font-display text-4xl text-white">Criar conta</h1>
      <p className="mt-3 text-sm leading-relaxed text-mist-muted">
        O pedido fica parado até a administração liberar a conta. Sem essa
        liberação, o login não abre. A matéria só vai ao ar depois da
        publicação por um administrador.
      </p>
      <div className="mt-8 border border-white/10 bg-ink-elevated/40 p-6">
        <RegisterForm />
      </div>
      <p className="mt-6 text-sm text-mist-muted">
        Já tem conta?{" "}
        <Link href="/admin/login" className="text-mist hover:text-white">
          Entrar
        </Link>
      </p>
    </div>
  );
}
