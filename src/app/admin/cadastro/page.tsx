import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { RegisterForm } from "@/components/admin/RegisterForm";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <div className="mx-auto max-w-md py-8">
      <BrandLogo href="/" size="lg" priority />
      <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-mist-dim">
        Redação
      </p>
      <h1 className="mt-2 font-display text-4xl text-white">Criar conta</h1>
      <p className="mt-3 text-sm leading-relaxed text-mist-muted">
        Cada jornalista entra com o próprio e-mail e já pode escrever. A
        matéria só vai ao ar depois que a administração liberar a conta e
        publicar o texto.
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
