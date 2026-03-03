import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-provider";
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

export const metadata: Metadata = {
  title: "Integra Explorer",
  description: "Block explorer for Integra Layer blockchain",
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
          <div className="absolute -top-[40%] -left-[20%] size-[800px] rounded-full bg-integra-brand/[0.03] blur-[120px] animate-ambient-1" />
          <div className="absolute -bottom-[30%] -right-[15%] size-[600px] rounded-full bg-integra-pink/[0.03] blur-[100px] animate-ambient-2" />
          <div className="absolute top-[20%] right-[10%] size-[400px] rounded-full bg-integra-brand/[0.02] blur-[80px] animate-ambient-3" />
        </div>
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
