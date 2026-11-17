import Link from "next/link";
import { prisma } from "@/lib/db";
import { sendPortalMail } from "@/lib/mail";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";
import { siteConfig } from "@/data/site";

export const metadata = {
  ...pageMetadata({
    title: "Confirmar newsletter",
    description: "Confirmação de inscrição na newsletter da Ajoia Brasil.",
    path: "/newsletter/confirmar",
  }),
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ConfirmNewsletterPage({ searchParams }: Props) {
  const token = (await searchParams).token?.trim();
  const subscriber = token
    ? await prisma.newsletterSubscriber.findUnique({ where: { confirmToken: token } })
    : null;

  let ok = false;
  if (subscriber && !subscriber.confirmed) {
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { confirmed: true, confirmedAt: new Date(), confirmToken: null },
    });
    ok = true;
    void sendPortalMail({
      subject: "[Newsletter] inscrição confirmada",
      text: `${subscriber.email} confirmou a newsletter da ${siteConfig.name}.`,
    });
  } else if (subscriber?.confirmed) {
    ok = true;
  }

  const leave = subscriber?.unsubToken
    ? absoluteUrl(`/newsletter/sair?token=${subscriber.unsubToken}`)
    : null;

  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <h1 className="font-display text-4xl text-white">Newsletter</h1>
      <p className="mt-4 text-sm leading-relaxed text-mist-muted">
        {ok
          ? "Inscrição confirmada. O e-mail está na lista."
          : "Este link não confirma mais. Peça uma nova inscrição no site."}
      </p>
      {ok && leave && (
        <p className="mt-4 text-sm text-mist-muted">
          Para sair da lista, use{" "}
          <Link href={leave} className="text-mist hover:text-white">
            este link
          </Link>
          .
        </p>
      )}
    </div>
  );
}
