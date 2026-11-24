import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCents, orderStatusLabel } from "@/lib/store-format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedido",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ retorno?: string }>;
};

const returnCopy: Record<string, string> = {
  sucesso: "O navegador voltou como sucesso.",
  pendente: "O navegador voltou como pendente.",
  recusado: "O navegador voltou como recusado.",
};

export default async function PedidoPage({ params, searchParams }: Props) {
  const { codigo } = await params;
  const retorno = (await searchParams).retorno || "";
  const order = await prisma.storeOrder.findUnique({
    where: { code: codigo },
    include: { lines: true },
  });
  const notice = returnCopy[retorno];

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-5 md:py-14">
      <p className="kicker">Livraria</p>
      <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">Pedido</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist-muted">
        A volta do navegador não confirma o pagamento. O pedido só fica pago quando o Mercado Pago avisa o servidor.
      </p>
      {notice && <p className="mt-4 text-sm text-[var(--text)]">{notice}</p>}
      {order ? (
        <div className="mt-8 max-w-xl border border-[var(--line)] p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">{order.code}</p>
          <p className="mt-2 font-display text-3xl text-[var(--text)]">{orderStatusLabel[order.status]}</p>
          <ul className="mt-6 space-y-2 text-sm">
            {order.lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-4">
                <span>
                  {line.name} × {line.quantity}
                </span>
                <span>{formatCents(line.unitCents * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-[var(--text)]">Total {formatCents(order.totalCents)}</p>
        </div>
      ) : (
        <p className="mt-8 text-sm text-mist-muted">Não há pedido com este código.</p>
      )}
      <Link href="/livraria" className="mt-8 inline-flex text-sm text-[var(--text)]">
        Voltar à livraria
      </Link>
    </div>
  );
}
