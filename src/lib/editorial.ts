import { prisma } from "@/lib/db";

export const articleStatuses = ["DRAFT", "PENDING", "PUBLISHED"] as const;
export type ArticleStatusValue = (typeof articleStatuses)[number];

export function articleStatusLabel(status: ArticleStatusValue) {
  if (status === "PUBLISHED") return "Publicado";
  if (status === "PENDING") return "Aguardando avaliação";
  return "Rascunho";
}

export async function resolveArticleStatus(opts: {
  role: string;
  userId: string;
  requested: ArticleStatusValue;
}): Promise<
  { status: ArticleStatusValue } | { error: string; statusCode: number }
> {
  if (opts.role === "ADMIN") {
    return { status: opts.requested };
  }

  if (opts.requested === "PUBLISHED") {
    return {
      error: "Só a administração pode publicar.",
      statusCode: 403,
    };
  }

  if (opts.requested === "PENDING") {
    const user = await prisma.user.findUnique({
      where: { id: opts.userId },
      select: { approved: true, active: true },
    });
    if (!user?.active || !user.approved) {
      return {
        error:
          "Sua conta ainda não foi liberada. Salve como rascunho até a administração autorizar o envio.",
        statusCode: 403,
      };
    }
  }

  return { status: opts.requested === "PENDING" ? "PENDING" : "DRAFT" };
}
