import { prisma } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({
    title: "Sair da newsletter",
    description: "Descadastro da newsletter da Ajoia Brasil.",
    path: "/newsletter/sair",
  }),
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function LeaveNewsletterPage({ searchParams }: Props) {
  const token = (await searchParams).token?.trim();
  const subscriber = token
    ? await prisma.newsletterSubscriber.findUnique({ where: { unsubToken: token } })
    : null;

  if (subscriber) {
    await prisma.newsletterSubscriber.delete({ where: { id: subscriber.id } });
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <h1 className="font-display text-4xl text-white">Newsletter</h1>
      <p className="mt-4 text-sm leading-relaxed text-mist-muted">
        {subscriber
          ? "O e-mail saiu da lista."
          : "Este link já não está ligado a uma inscrição."}
      </p>
    </div>
  );
}
