import { prisma } from "@/lib/db";

/**
 * Única rotina que marca um pedido como pago e baixa o estoque.
 * A fase de pagamento chama isto depois de conferir a assinatura do Mercado Pago.
 * A volta do navegador não passa por aqui.
 */
export async function settlePaidOrder(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.storeOrder.findUnique({
      where: { id: orderId },
      include: { lines: true },
    });
    if (!order) return null;
    if (order.status === "PAGO" || order.status === "ENVIADO" || order.status === "ENTREGUE") {
      return order;
    }
    if (order.status !== "AGUARDANDO_PAGAMENTO") return order;

    for (const line of order.lines) {
      if (!line.itemId) continue;
      const updated = await tx.storeItem.update({
        where: { id: line.itemId },
        data: { stock: { decrement: line.quantity } },
      });
      if (updated.stock < 0) {
        throw new Error("estoque");
      }
    }

    return tx.storeOrder.update({
      where: { id: order.id },
      data: { status: "PAGO" },
    });
  });
}

/** Devolução de estoque quando um pedido já pago é cancelado. Também fica para a fase de pagamento. */
export async function restoreCancelledOrder(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.storeOrder.findUnique({
      where: { id: orderId },
      include: { lines: true },
    });
    if (!order || order.status === "CANCELADO") return order;
    if (order.status === "PAGO" || order.status === "ENVIADO") {
      for (const line of order.lines) {
        if (!line.itemId) continue;
        await tx.storeItem.update({
          where: { id: line.itemId },
          data: { stock: { increment: line.quantity } },
        });
      }
    }
    return tx.storeOrder.update({
      where: { id: order.id },
      data: { status: "CANCELADO" },
    });
  });
}
