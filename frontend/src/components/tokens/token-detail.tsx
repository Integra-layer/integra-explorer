"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Coins,
  Hash,
  FileCode2,
  ShieldCheck,
  ShieldX,
  Layers,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DetailRow } from "@/components/ui/detail-row";
import { GlassCard, SkeletonShimmer, CopyButton } from "@/components/effects";
import { truncateAddress } from "@/lib/format";
import { useTokenContract } from "@/lib/hooks/use-tokens";
import { findKnownToken } from "@/lib/api/tokens";
import { ActivityFeed } from "@/components/address/activity-feed";

interface TokenDetailProps {
  address: string;
}

// ---------------------------------------------------------------------------
// Format supply from raw value
// ---------------------------------------------------------------------------

function formatSupplyFull(raw: string | null, decimals: number | null): string {
  if (!raw) return "N/A";
  const dec = decimals ?? 18;
  const num = Number(raw) / Math.pow(10, dec);
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
// Detect token standard from contract patterns
// ---------------------------------------------------------------------------

function detectStandard(patterns: string[]): string {
  if (patterns.includes("erc721")) return "ERC-721";
  if (patterns.includes("erc1155")) return "ERC-1155";
  if (patterns.includes("erc20")) return "ERC-20";
  // Default if contract has tokenName
  return "ERC-20";
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function TokenDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SkeletonShimmer className="h-9 w-56" />
        <SkeletonShimmer className="h-9 w-32" />
      </div>

      {/* Summary card */}
      <GlassCard className="p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <SkeletonShimmer className="h-3.5 w-24" />
              <SkeletonShimmer className="h-5 w-44" />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Transfer history placeholder */}
      <GlassCard className="p-6">
        <SkeletonShimmer className="mb-4 h-6 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonShimmer key={i} className="h-12 w-full" />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TokenDetail({ address }: TokenDetailProps) {
  const { data: contract, isLoading, error } = useTokenContract(address);
  const knownToken = findKnownToken(address);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Token Not Found</h1>
        <p className="text-muted-foreground">
          Contract at{" "}
          <span className="font-mono text-xs">{truncateAddress(address)}</span>{" "}
          could not be loaded.
        </p>
        <Button asChild variant="outline">
          <Link href="/tokens">
            <ArrowLeft className="mr-1 size-4" />
            Back to Tokens
          </Link>
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading || !contract) {
    return <TokenDetailSkeleton />;
  }

  // Resolve display values — prefer on-chain data, fall back to static registry
  const tokenName =
    contract.tokenName || knownToken?.name || contract.name || "Unknown Token";
  const tokenSymbol = contract.tokenSymbol || knownToken?.symbol || "???";
  const tokenDecimals = contract.tokenDecimals ?? knownToken?.decimals ?? 18;
  const tokenTotalSupply =
    contract.tokenTotalSupply || knownToken?.totalSupply || null;
  const standard = detectStandard(contract.patterns ?? []);
  const isVerified =
    contract.verificationStatus === "verified" ||
    contract.verificationStatus === "success" ||
    contract.verification != null;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Token icon */}
          <div
            className="flex size-10 items-center justify-center rounded-full font-bold text-white"
            style={{
              background: knownToken?.featured
                ? "linear-gradient(135deg, var(--integra-brand-pink), var(--integra-brand))"
                : `hsl(${tokenSymbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 60%, 45%)`,
            }}
          >
            {tokenSymbol.charAt(0)}
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              {tokenName}
              <Badge variant="secondary" className="font-mono text-sm">
                {tokenSymbol}
              </Badge>
            </h1>
          </div>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/tokens">
            <ArrowLeft className="mr-1 size-4" />
            All Tokens
          </Link>
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Summary Card */}
      {/* ------------------------------------------------------------------ */}
      <GlassCard className="p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Name */}
          <DetailRow label="Token Name" icon={Coins}>
            <span className="font-medium">{tokenName}</span>
          </DetailRow>

          {/* Symbol */}
          <DetailRow label="Symbol">
            <span className="font-mono font-medium">{tokenSymbol}</span>
          </DetailRow>

          {/* Decimals */}
          <DetailRow label="Decimals" icon={CircleDot}>
            <span className="font-mono">{tokenDecimals}</span>
          </DetailRow>

          {/* Total Supply */}
          <DetailRow label="Total Supply" icon={Layers}>
            <span className="font-mono">
              {formatSupplyFull(tokenTotalSupply, tokenDecimals)}{" "}
              <span className="text-muted-foreground">{tokenSymbol}</span>
            </span>
          </DetailRow>

          {/* Token Standard */}
          <DetailRow label="Token Standard" icon={FileCode2}>
            <Badge variant="outline">{standard}</Badge>
          </DetailRow>

          {/* Verification Status */}
          <DetailRow
            label="Verification"
            icon={isVerified ? ShieldCheck : ShieldX}
          >
            {isVerified ? (
              <Badge className="bg-integra-success/20 text-integra-success">
                <ShieldCheck className="mr-1 size-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">
                <ShieldX className="mr-1 size-3" />
                Unverified
              </Badge>
            )}
          </DetailRow>

          {/* Contract Address */}
          <DetailRow label="Contract Address" icon={Hash}>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/address/${address}`}
                className="font-mono text-xs text-integra-brand hover:underline"
              >
                <span className="hidden md:inline">{address}</span>
                <span className="md:hidden">{truncateAddress(address, 8)}</span>
              </Link>
              <CopyButton text={address} />
            </div>
          </DetailRow>

          {/* Proxy */}
          {contract.proxy && (
            <DetailRow label="Proxy Implementation">
              <Link
                href={`/address/${contract.proxy}`}
                className="font-mono text-xs text-integra-brand hover:underline"
              >
                {truncateAddress(contract.proxy, 8)}
              </Link>
            </DetailRow>
          )}
        </div>
      </GlassCard>

      {/* ------------------------------------------------------------------ */}
      {/* Transfer History */}
      {/* ------------------------------------------------------------------ */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Coins className="size-4 text-integra-brand" />
            <h2 className="text-base font-semibold">Transactions</h2>
          </div>
          <Link
            href={`/address/${address}`}
            className="text-sm text-muted-foreground transition-colors hover:text-integra-brand"
          >
            View on address page &rarr;
          </Link>
        </div>

        <div className="px-6 py-4">
          <ActivityFeed address={address} contractFilter />
        </div>
      </GlassCard>
    </motion.div>
  );
}
