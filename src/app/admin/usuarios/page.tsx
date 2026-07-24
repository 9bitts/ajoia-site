import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserCreateForm } from "@/components/admin/UserCreateForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({
    where: { role: "COLUMNIST" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
          Administração
        </p>
        <h1 className="mt-2 font-display text-4xl text-white">Usuários</h1>
        <p className="mt-3 text-sm text-mist-muted">
          Só o admin cria contas. Entregue e-mail e senha ao colunista.
        </p>

        <ul className="mt-8 space-y-3">
          {users.map((user) => (
            <li
              key={user.id}
              className="border border-white/10 px-4 py-3 text-sm"
            >
              <p className="font-display text-lg text-white">{user.name}</p>
              <p className="text-mist-muted">{user.email}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-mist-dim">
                {user.roleLabel} · /{user.slug}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <UserCreateForm />
    </div>
  );
}
