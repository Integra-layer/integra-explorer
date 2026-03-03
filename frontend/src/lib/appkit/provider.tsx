"use client";

import type { AppKitNetwork } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { WagmiProvider } from "wagmi";
import { integraTestnet, integraMainnet } from "./chains";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

if (!projectId) {
  console.warn(
    "[AppKit] NEXT_PUBLIC_REOWN_PROJECT_ID is empty — wallet features will not work.",
  );
}

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

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>{children}</WagmiProvider>
  );
}
