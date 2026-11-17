import { prisma } from "@/lib/db";

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const PENDING_NEWSLETTER_MS = 14 * 24 * 60 * 60 * 1000;

export async function purgeExpiredPersonalData() {
  const contactBefore = new Date(Date.now() - YEAR_MS);
  const pendingBefore = new Date(Date.now() - PENDING_NEWSLETTER_MS);
  const [contacts, pending] = await Promise.all([
    prisma.contactMessage.deleteMany({ where: { createdAt: { lt: contactBefore } } }),
    prisma.newsletterSubscriber.deleteMany({
      where: { confirmed: false, createdAt: { lt: pendingBefore } },
    }),
  ]);
  return { contacts: contacts.count, pendingNewsletters: pending.count };
}
