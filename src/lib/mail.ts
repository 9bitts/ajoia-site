import nodemailer from "nodemailer";
import { siteConfig } from "@/data/site";

export function portalInbox() {
  return (process.env.GMAIL_USER || siteConfig.email).trim();
}

export function mailConfigured() {
  return Boolean(process.env.GMAIL_USER?.trim() && process.env.GMAIL_APP_PASSWORD?.trim());
}

export async function sendPortalMail(opts: {
  to?: string;
  replyTo?: string;
  subject: string;
  text: string;
}) {
  if (!mailConfigured()) return { sent: false as const, reason: "unconfigured" as const };

  const user = process.env.GMAIL_USER!.trim();
  const pass = process.env.GMAIL_APP_PASSWORD!.replace(/\s/g, "");

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `${siteConfig.name} <${user}>`,
      to: opts.to || user,
      replyTo: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
    });

    return { sent: true as const };
  } catch (error) {
    console.error("gmail send failed", error);
    return { sent: false as const, reason: "failed" as const };
  }
}
