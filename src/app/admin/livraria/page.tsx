import Link from "next/link";
import { LivreiroCreateForm } from "@/components/admin/LivreiroCreateForm";
import { StoreAdminNav } from "@/components/admin/StoreAdminNav";
import { prisma } from "@/lib/db";
import { requireStorePage } from "@/lib/store-access";
import { formatCents, kindLabel, statusLabel } from "@/lib/store-format";

export const dynamic = "force-dynamic";

export default async function LivrariaAdminPage() {
  const session = await requireStorePage();
  const items = await prisma.storeItem.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">Livraria</p>
      <h1 className="mt-2 font-display text-4xl text-white">Itens</h1>
      <p className="mt-3 max-w-2xl text-sm text-mist-muted">
        Cadastre livros e outros itens. O que está publicado aparece na vitrine. O estoque só muda por ajuste manual.
      </p>
      <StoreAdminNav />

      <div className="mt-8 overflow-x-auto border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.14em] text-mist-dim">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Estoque</th>
              <th className="px-4 py-3 font-medium">Situação</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  <Link href={`/admin/livraria/itens/${item.id}`} className="text-white hover:text-mist">
                    {item.name}
                  </Link>
                  <p className="text-xs text-mist-dim">{item.category?.name || "Sem categoria"}</p>
                </td>
                <td className="px-4 py-3 text-mist-muted">{kindLabel[item.kind]}</td>
                <td className="px-4 py-3 text-mist-muted">{formatCents(item.priceCents)}</td>
                <td className="px-4 py-3 text-mist-muted">{item.stock}</td>
                <td className="px-4 py-3 text-mist-muted">{statusLabel[item.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="px-4 py-8 text-sm text-mist-muted">
            Nenhum item ainda.{" "}
            <Link href="/admin/livraria/itens/novo" className="text-white">
              Cadastrar o primeiro
            </Link>
            .
          </p>
        )}
      </div>

      {session.user.role === "ADMIN" && (
        <div className="mt-12 max-w-xl">
          <LivreiroCreateForm />
        </div>
      )}
    </div>
  );
}
