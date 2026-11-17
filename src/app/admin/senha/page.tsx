import { auth } from "@/auth";
import { PasswordForm } from "@/components/admin/PasswordForm";

export const dynamic = "force-dynamic";

export default async function PasswordPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">Conta</p>
      <h1 className="mt-2 font-display text-4xl text-white">Senha</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist-muted">
        {session.user.mustChangePassword
          ? "Esta senha precisa ser trocada antes de seguir na redação."
          : "Troque a senha desta conta. As outras sessões deixam de valer."}
      </p>
      <div className="mt-8">
        <PasswordForm />
      </div>
    </div>
  );
}
