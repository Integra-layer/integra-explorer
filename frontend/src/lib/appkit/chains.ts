import { defineChain } from "viem";

export const integraTestnet = defineChain({
  id: 26218,
  name: "Integra Testnet",
  nativeCurrency: { name: "IRL", symbol: "IRL", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_EVM_RPC_URL ||
          "https://testnet.integralayer.com/evm",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Integra Explorer",
      url: "https://testnet.explorer.integralayer.com",
    },
  },
});

export const integraMainnet = defineChain({
  id: 26217,
  name: "Integra Mainnet",
  nativeCurrency: { name: "IRL", symbol: "IRL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.integralayer.com/evm"],
    },
  },
  blockExplorers: {
    default: {
      name: "Integra Explorer",
      url: "https://scan.integralayer.com",
    },
  },
});
