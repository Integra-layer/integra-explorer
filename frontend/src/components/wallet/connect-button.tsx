"use client";

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/format";

interface ConnectButtonProps {
  size?: "sm" | "default";
  className?: string;
}

export function ConnectButton({ size = "default", className }: ConnectButtonProps) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const isSmall = size === "sm";

  if (isConnected && address) {
    return (
      <motion.button
        onClick={() => open()}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative overflow-hidden rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 transition-all duration-200",
          "hover:border-integra-brand/60 hover:bg-white/20 dark:hover:bg-white/10",
          "flex items-center gap-2 font-medium",
          isSmall ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
          className,
        )}
        aria-label="Manage wallet"
      >
        {/* Green dot indicator */}
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-integra-success opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-integra-success" />
        </span>

        <span className="font-mono">{truncateAddress(address)}</span>

        {/* Bottom gradient accent bar */}
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-integra-pink to-integra-brand opacity-80" />
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={() => open()}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 0 20px rgba(255,109,73,0.3)",
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-xl bg-gradient-to-r from-integra-pink to-integra-brand text-white",
        "flex items-center gap-2 font-semibold transition-all duration-200",
        isSmall ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        className,
      )}
      aria-label="Connect wallet"
    >
      <Wallet className={isSmall ? "size-3.5" : "size-4"} />
      Connect Wallet
    </motion.button>
  );
}
