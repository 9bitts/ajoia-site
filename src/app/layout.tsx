import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteChrome } from "@/components/SiteChrome";
import { ThemeProvider } from "@/components/ThemeProvider";
import { siteConfig } from "@/data/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const themeInitScript = `(function(){try{var t=localStorage.getItem("ajoia-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}else{document.documentElement.setAttribute("data-theme","light");}}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

const analyticsOn =
  /^GTM-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GTM_ID || "") ||
  /^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "");

const consentBoot = `(function(){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;var stored=null;try{stored=localStorage.getItem("ajoia-consent");}catch(e){}var granted=stored==="granted";gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:granted?"granted":"denied",functionality_storage:"granted",security_storage:"granted",wait_for_update:500});})();`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${siteConfig.name} — Jornalismo Independente`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "news",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: siteConfig.name }],
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
    images: [{ url: "/images/logo-ajoia.png", alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/images/logo-ajoia.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070708" },
    { media: "(prefers-color-scheme: light)", color: "#f3f4f6" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {analyticsOn && (
          <Script id="consent-default" strategy="beforeInteractive">
            {consentBoot}
          </Script>
        )}
      </head>
      <body
        className={`${sans.variable} ${display.variable} ${serif.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="site-shell min-h-screen">
            <SiteChrome header={<Header />} footer={<Footer />}>
              {children}
            </SiteChrome>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
