import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  "login.success": "Entrou",
  "login.failure": "Falha de login",
  "article.publish": "Publicou",
  "article.delete": "Apagou matéria",
  "article.revision": "Enviou revisão",
  "article.revision_discard": "Descartou revisão",
  "user.approve": "Liberou conta",
  "user.suspend": "Suspendeu conta",
  "user.create": "Criou conta",
  "user.profile": "Atualizou foto ou bio",
  "user.password_reset": "Redefiniu senha",
  "user.password_change": "Trocou a própria senha",
  "user.password_change_blocked": "Tentou trocar a senha fixa",
  "media.delete": "Apagou imagem",
  "totp.enable": "Ligou segundo fator",
  "totp.disable": "Desligou segundo fator",
};

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN") redirect("/admin");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">Administração</p>
      <h1 className="mt-2 font-display text-4xl text-white">Auditoria</h1>
      <p className="mt-3 max-w-2xl text-sm text-mist-muted">
        Últimos 100 atos da redação. Senha e texto de mensagem não entram aqui.
      </p>
      <ul className="mt-8 space-y-2">
        {logs.length === 0 && <li className="text-sm text-mist-muted">Nenhum registro ainda.</li>}
        {logs.map((log) => (
          <li key={log.id} className="border border-white/10 px-4 py-3 text-sm">
            <p className="text-white">{labels[log.action] || log.action}</p>
            <p className="mt-1 text-xs text-mist-dim">
              {log.actorEmail || "—"}
              {log.detail ? ` · ${log.detail}` : ""} ·{" "}
              {log.createdAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
