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
