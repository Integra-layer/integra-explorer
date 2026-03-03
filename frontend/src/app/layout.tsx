import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-provider";
import { AppKitProvider } from "@/lib/appkit/provider";
import { ExplorerProvider } from "@/lib/explorer-provider";
import { QueryProvider } from "@/lib/query-provider";
import { PusherProvider } from "@/lib/pusher-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/navbar";
import { NetworkStatusBar } from "@/components/layout/network-status-bar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/search/command-palette";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

import { DEFAULT_SITE_URL } from "@/lib/constants";

const BASE_URL = DEFAULT_SITE_URL;

export const metadata: Metadata = {
  title: {
    default: "Integra Explorer",
    template: "%s | Integra Explorer",
  },
  description:
    "Explore blocks, transactions, validators, and governance on the Integra Layer blockchain.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    siteName: "Integra Explorer",
    title: "Integra Explorer",
    description:
      "Explore blocks, transactions, validators, and governance on the Integra Layer blockchain.",
    url: BASE_URL,
    images: [],
  },
  twitter: {
    card: "summary_large_image",
    title: "Integra Explorer",
    description:
      "Explore blocks, transactions, validators, and governance on the Integra Layer blockchain.",
    images: [],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased overflow-x-hidden`}
      >
        {/* Ambient background lighting */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -left-[10%] size-[1000px] rounded-full bg-integra-brand/[0.15] dark:bg-integra-brand/[0.08] blur-[150px] animate-ambient-1" />
          <div className="absolute -bottom-[20%] -right-[10%] size-[800px] rounded-full bg-integra-pink/[0.12] dark:bg-integra-pink/[0.07] blur-[130px] animate-ambient-2" />
          <div className="absolute top-[30%] right-[15%] size-[600px] rounded-full bg-integra-brand/[0.10] dark:bg-integra-brand/[0.05] blur-[100px] animate-ambient-3" />
        </div>
        <ThemeProvider>
          <AppKitProvider>
            <QueryProvider>
              <ExplorerProvider>
                <PusherProvider>
                  <TooltipProvider>
                    <div className="flex min-h-screen flex-col">
                      <Navbar />
                      <NetworkStatusBar />
                      <main className="flex-1">{children}</main>
                      <Footer />
                    </div>
                    <CommandPalette />
                  </TooltipProvider>
                </PusherProvider>
              </ExplorerProvider>
            </QueryProvider>
          </AppKitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
