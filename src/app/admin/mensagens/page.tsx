import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { mailConfigured, portalInbox } from "@/lib/mail";

export const dynamic = "force-dynamic";

export default async function MessagesAdminPage() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN") redirect("/admin");

  const [messages, subscribers] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <div className="grid gap-12">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">Administração</p>
        <h1 className="mt-2 font-display text-4xl text-white">Caixa</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-muted">
          Contato e newsletter ficam nesta caixa e também seguem para {portalInbox()}.
          {mailConfigured()
            ? " O envio pelo Gmail está ativo."
            : " O envio pelo Gmail ainda não sai: falta a senha de app em GMAIL_APP_PASSWORD."}
        </p>
      </div>

      <section>
        <h2 className="font-display text-2xl text-white">Mensagens</h2>
        {messages.length === 0 ? (
          <p className="mt-4 text-sm text-mist-muted">Nenhuma mensagem ainda.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {messages.map((item) => (
              <li key={item.id} className="border border-white/10 px-4 py-4">
                <p className="text-sm text-white">{item.subject}</p>
                <p className="mt-1 text-xs text-mist-dim">
                  {item.name} · {item.email} ·{" "}
                  {item.createdAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-mist-muted">
                  {item.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl text-white">Newsletter</h2>
        {subscribers.length === 0 ? (
          <p className="mt-4 text-sm text-mist-muted">Nenhuma inscrição ainda.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm text-mist-muted">
            {subscribers.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 border-b border-white/10 py-2">
                <span className="text-white">{item.email}</span>
                <span className="text-xs text-mist-dim">
                  {item.createdAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
