import { StoreAdminNav } from "@/components/admin/StoreAdminNav";
import { StoreItemForm } from "@/components/admin/StoreItemForm";
import { prisma } from "@/lib/db";
import { requireStorePage } from "@/lib/store-access";

export const dynamic = "force-dynamic";

export default async function NovoItemPage() {
  await requireStorePage();
  const categories = await prisma.storeCategory.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-3xl">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">Livraria</p>
      <h1 className="mt-2 font-display text-4xl text-white">Novo item</h1>
      <StoreAdminNav />
      <div className="mt-8">
        <StoreItemForm categories={categories} />
      </div>
    </div>
  );
}
