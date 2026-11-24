import { StoreAdminNav } from "@/components/admin/StoreAdminNav";
import { StoreCategoryManager } from "@/components/admin/StoreCategoryManager";
import { prisma } from "@/lib/db";
import { requireStorePage } from "@/lib/store-access";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  await requireStorePage();
  const categories = await prisma.storeCategory.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="max-w-3xl">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">Livraria</p>
      <h1 className="mt-2 font-display text-4xl text-white">Categorias</h1>
      <p className="mt-3 text-sm text-mist-muted">
        As categorias da loja são próprias. Não usam as editorias do jornal.
      </p>
      <StoreAdminNav />
      <div className="mt-8">
        <StoreCategoryManager
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            items: category._count.items,
          }))}
        />
      </div>
    </div>
  );
}
