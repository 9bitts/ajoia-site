import type { BookBinding, StoreItemKind, StoreItemStatus, StoreOrderStatus } from "@prisma/client";

export function formatCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export const kindLabel: Record<StoreItemKind, string> = {
  LIVRO: "Livro",
  OUTRO: "Outro item",
};

export const statusLabel: Record<StoreItemStatus, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
};

export const bindingLabel: Record<BookBinding, string> = {
  BROCHURA: "Brochura",
  DURA: "Capa dura",
  POCKET: "Pocket",
};

export const orderStatusLabel: Record<StoreOrderStatus, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  PAGO: "Pago",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export function stockLabel(stock: number) {
  return stock > 0 ? "Disponível" : "Esgotado";
}
