"use client";

import Link from "next/link";
import { useAppKitAccount } from "@reown/appkit/react";
import { ConnectButton } from "@/components/wallet/connect-button";
import { useBalance } from "wagmi";
import { Wallet, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

function CopyableAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm">
      <span className="flex-1 break-all text-foreground">{address}</span>
      <button
        onClick={handleCopy}
        className="shrink-0 text-muted-foreground transition-colors hover:text-integra-brand"
        aria-label="Copy address"
      >
        {copied ? (
          <CheckCircle className="size-4 text-integra-success" />
        ) : (
          <Copy className="size-4" />
        )}
      </button>
    </div>
  );
}

function ConnectedView({ address }: { address: string }) {
  const { data: balance, isLoading } = useBalance({
    address: address as `0x${string}`,
  });

  const formattedBalance = balance
    ? `${(Number(balance.value) / 10 ** balance.decimals).toFixed(4)} ${balance.symbol}`
    : isLoading
      ? "Loading..."
      : "—";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-integra-pink to-integra-brand">
          <Wallet className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">My Account</h1>
          <p className="text-sm text-muted-foreground">Connected wallet</p>
        </div>
        <Badge
          variant="outline"
          className="ml-auto border-integra-success/40 bg-integra-success/10 text-integra-success"
        >
          Connected
        </Badge>
      </div>

      {/* Address card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm dark:bg-white/[0.03]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Address
        </p>
        <CopyableAddress address={address} />
        <Link
          href={`/address/${address}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-integra-brand hover:underline"
        >
          View on Explorer
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {/* Balance card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm dark:bg-white/[0.03]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          IRL Balance
        </p>
        <p className="font-mono text-2xl font-bold text-foreground">
          {formattedBalance}
        </p>
      </div>

      {/* Disconnect button */}
      <div className="flex justify-end">
        <ConnectButton />
      </div>
    </div>
  );
}

function DisconnectedView() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-integra-pink/20 to-integra-brand/20 ring-1 ring-integra-brand/30">
        <Wallet className="size-8 text-integra-brand" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
        <p className="mt-2 text-muted-foreground">
          Connect your wallet to view your account balance and transaction
          history on Integra Layer.
        </p>
      </div>
      <ConnectButton />
    </div>
  );
}

export default function AccountPage() {
  const { address, isConnected } = useAppKitAccount();

  return (
    <div className="container mx-auto px-4 py-10">
      {isConnected && address ? (
        <ConnectedView address={address} />
      ) : (
        <DisconnectedView />
      )}
    </div>
  );
}
