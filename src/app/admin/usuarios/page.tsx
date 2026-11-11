import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserAccessRow } from "@/components/admin/UserAccessRow";
import { UserCreateForm } from "@/components/admin/UserCreateForm";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({
    where: { role: "COLUMNIST" },
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
  });
  const waiting = users.filter((user) => !user.approved).length;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
          Administração
        </p>
        <h1 className="mt-2 font-display text-4xl text-white">Contas</h1>
        <p className="mt-3 text-sm leading-relaxed text-mist-muted">
          Libere o acesso de quem criou conta. Para ler as matérias de alguém,
          use o botão Matérias — ou volte para a{" "}
          <a href="/admin" className="text-gold">
            lista de colunistas
          </a>
          .
          {waiting > 0 && (
            <>
              {" "}
              <span className="text-amber-200">
                {waiting} {waiting === 1 ? "conta aguardando" : "contas aguardando"}.
              </span>
            </>
          )}
        </p>

        <ul className="mt-8 space-y-3">
          {users.map((user) => (
            <UserAccessRow
              key={user.id}
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
                slug: user.slug,
                roleLabel: user.roleLabel,
                approved: user.approved,
                createdLabel: formatDate(user.createdAt.toISOString().slice(0, 10)),
              }}
            />
          ))}
        </ul>
      </div>
      <UserCreateForm />
    </div>
  );
}
