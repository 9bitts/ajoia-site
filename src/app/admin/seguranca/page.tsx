import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TotpForm } from "@/components/admin/TotpForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN") redirect("/admin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true },
  });

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">Administração</p>
      <h1 className="mt-2 font-display text-4xl text-white">Segurança</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist-muted">
        Segundo fator só para a administração. Use um aplicativo autenticador (código de 6 dígitos, 30 segundos).
      </p>
      <div className="mt-8">
        <TotpForm enabled={Boolean(user?.totpEnabled)} />
      </div>
    </div>
  );
}
