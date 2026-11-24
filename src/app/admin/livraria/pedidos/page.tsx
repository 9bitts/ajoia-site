import { StoreAdminNav } from "@/components/admin/StoreAdminNav";
import { prisma } from "@/lib/db";
import { requireStorePage } from "@/lib/store-access";
import { formatCents, orderStatusLabel } from "@/lib/store-format";

export const dynamic = "force-dynamic";

const statuses = [
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "ENVIADO",
  "ENTREGUE",
  "CANCELADO",
] as const;

export default async function PedidosPage() {
  await requireStorePage();
  const orders = await prisma.storeOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { lines: { select: { id: true } } },
  });

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">Livraria</p>
      <h1 className="mt-2 font-display text-4xl text-white">Pedidos</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-muted">
        A lista está pronta. O pedido nasce quando o pagamento for ligado, no checkout, com status
        aguardando pagamento. O estoque só sai quando o Mercado Pago confirmar. Cancelar um pedido
        pago devolve o estoque.
      </p>
      <StoreAdminNav />

      <ul className="mt-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-mist-dim">
        {statuses.map((status) => (
          <li key={status} className="border border-white/10 px-3 py-2">
            {orderStatusLabel[status]}
          </li>
        ))}
      </ul>

      <div className="mt-8 overflow-x-auto border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.14em] text-mist-dim">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Comprador</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Situação</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-white/10">
                <td className="px-4 py-3 text-white">{order.code}</td>
                <td className="px-4 py-3 text-mist-muted">
                  {order.buyerName}
                  <span className="block text-xs">{order.buyerEmail}</span>
                </td>
                <td className="px-4 py-3 text-mist-muted">{formatCents(order.totalCents)}</td>
                <td className="px-4 py-3 text-mist-muted">{orderStatusLabel[order.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="px-4 py-8 text-sm text-mist-muted">
            Nenhum pedido. A cobrança ainda não está ligada.
          </p>
        )}
      </div>
    </div>
  );
}
