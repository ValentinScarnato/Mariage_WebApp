import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { Providers } from "@/components/providers";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: `${siteConfig.partner1} & ${siteConfig.partner2}`,
  description: siteConfig.tagline,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#8c9a7b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable} h-full`}>
      <body className="min-h-full font-sans text-ink bg-page-bg antialiased">
        <div className="mx-auto min-h-dvh max-w-md bg-cream relative">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
