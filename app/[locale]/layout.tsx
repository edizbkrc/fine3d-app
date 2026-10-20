import "../../styles/globals.css";
import { notFound } from "next/navigation";
import { Lato } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import BaseProvider from "@/providers";
import GATracker from "@components/GATracker";
import type { Metadata } from "next";

export const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages();

  return {
    title: messages.Meta?.Title?.toString() || "Fine3D App",
    description: messages.Meta?.Description?.toString() || "3D application",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_BASE_URL || "https://t-app.fine3d.com.tr"
    ),
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
        { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
        { url: "/favicon-128x128.png", sizes: "128x128", type: "image/png" },
        { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    manifest: "/manifest.json",
    appleWebApp: {
      statusBarStyle: "default",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: any;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script src="/theme-init.js" />
      </head>
      <body className={`${lato.className}`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <BaseProvider>
            <GATracker />
            {children}
          </BaseProvider>
        </NextIntlClientProvider>
      </body>
      <GoogleAnalytics gaId="G-9Q1W7B7PB0" />
    </html>
  );
}

