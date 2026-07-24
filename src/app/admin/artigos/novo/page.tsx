import { auth } from "@/auth";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function NewArticlePage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
        Artigos
      </p>
      <h1 className="mt-2 font-display text-4xl text-white">Novo artigo</h1>
      <div className="mt-8">
        <ArticleForm
          mode="create"
          isAdmin={session.user.role === "ADMIN"}
          initial={{
            title: "",
            dek: "",
            body: "",
            section: "politica",
            status: "DRAFT",
            featured: false,
            breaking: false,
            imageUrl: null,
          }}
        />
      </div>
    </div>
  );
}
