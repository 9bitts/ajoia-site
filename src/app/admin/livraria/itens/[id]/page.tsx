import { notFound } from "next/navigation";
import { StoreAdminNav } from "@/components/admin/StoreAdminNav";
import { StoreItemForm } from "@/components/admin/StoreItemForm";
import { StoreStockForm } from "@/components/admin/StoreStockForm";
import { prisma } from "@/lib/db";
import { requireStorePage } from "@/lib/store-access";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditarItemPage({ params }: Props) {
  await requireStorePage();
  const { id } = await params;
  const [item, categories] = await Promise.all([
    prisma.storeItem.findUnique({ where: { id } }),
    prisma.storeCategory.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!item) notFound();

  return (
    <div className="max-w-3xl">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">Livraria</p>
      <h1 className="mt-2 font-display text-4xl text-white">{item.name}</h1>
      <StoreAdminNav />
      <div className="mt-8 space-y-8">
        <StoreStockForm id={item.id} stock={item.stock} />
        <StoreItemForm
          categories={categories}
          initial={{
            id: item.id,
            kind: item.kind,
            name: item.name,
            slug: item.slug,
            synopsis: item.synopsis,
            description: item.description,
            priceCents: item.priceCents,
            coverUrl: item.coverUrl,
            coverAlt: item.coverAlt,
            status: item.status,
            featured: item.featured,
            weightGrams: item.weightGrams,
            widthCm: item.widthCm,
            heightCm: item.heightCm,
            depthCm: item.depthCm,
            isbn13: item.isbn13,
            authors: item.authors,
            publisher: item.publisher,
            edition: item.edition,
            year: item.year,
            pages: item.pages,
            language: item.language,
            binding: item.binding,
            categoryId: item.categoryId,
          }}
        />
      </div>
    </div>
  );
}
