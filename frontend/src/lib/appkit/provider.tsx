"use client";

import type { AppKitNetwork } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { integraTestnet, integraMainnet } from "./chains";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  integraTestnet,
  integraMainnet,
];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: integraTestnet,
  metadata: {
    name: "Integra Explorer",
    description: "Explore the Integra Layer blockchain",
    url: "https://testnet.explorer.integralayer.com",
    icons: ["/logos/integra-mark.svg"],
  },
  features: {
    email: false,
    socials: [],
  },
  themeVariables: {
    "--w3m-accent": "#FF6D49",
  },
});

const wagmiQueryClient = new QueryClient();

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={wagmiQueryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
