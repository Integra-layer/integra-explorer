"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GlassCard,
  HoverLift,
  CopyButton,
  SkeletonShimmer,
} from "@/components/effects";
import { truncateAddress } from "@/lib/format";
import type { KnownToken } from "@/lib/api/tokens";

interface TokenListProps {
  tokens: KnownToken[];
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Format total supply from raw wei string to human-readable
// ---------------------------------------------------------------------------

function formatTokenSupply(
  rawSupply: string | undefined,
  decimals: number,
): string {
  if (!rawSupply) return "N/A";
  const num = Number(rawSupply) / Math.pow(10, decimals);
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
  }
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
// Token icon — colored circle with first letter of symbol
// ---------------------------------------------------------------------------

function TokenIcon({
  symbol,
  featured,
}: {
  symbol: string;
  featured?: boolean;
}) {
  // Generate a deterministic hue from the symbol
  const hue =
    symbol.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;

  return (
    <div
      className="flex size-10 items-center justify-center rounded-full font-bold text-white"
      style={{
        background: featured
          ? "linear-gradient(135deg, var(--integra-brand-pink), var(--integra-brand))"
          : `hsl(${hue}, 60%, 45%)`,
      }}
    >
      {symbol.charAt(0)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function TokenListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Featured skeleton */}
      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <SkeletonShimmer className="size-10 rounded-full" />
            <div className="space-y-2">
              <SkeletonShimmer className="h-6 w-32" />
              <SkeletonShimmer className="h-4 w-48" />
            </div>
          </div>
          <SkeletonShimmer className="h-9 w-28" />
        </div>
      </GlassCard>

      {/* Table skeleton */}
      <GlassCard className="overflow-hidden">
        <div className="space-y-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border/30 px-6 py-4"
            >
              <SkeletonShimmer className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <SkeletonShimmer className="h-4 w-40" />
                <SkeletonShimmer className="h-3 w-60" />
              </div>
              <SkeletonShimmer className="h-4 w-20" />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Featured token card
// ---------------------------------------------------------------------------

function FeaturedTokenCard({ token }: { token: KnownToken }) {
  return (
    <HoverLift>
      <GlassCard className="relative overflow-hidden border-integra-brand/30 p-6">
        {/* Subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-integra-brand/5 to-transparent" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <TokenIcon symbol={token.symbol} featured />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{token.name}</h3>
                <Badge className="bg-integra-brand/20 text-integra-brand">
                  <Star className="mr-1 size-3" />
                  Featured
                </Badge>
                {token.standard && (
                  <Badge variant="outline" className="text-xs">
                    {token.standard}
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="font-mono font-medium text-foreground">
                  {token.symbol}
                </span>
                <span>
                  Supply:{" "}
                  <span className="text-foreground">
                    {formatTokenSupply(token.totalSupply, token.decimals)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="hidden font-mono text-xs sm:inline">
                    {truncateAddress(token.address, 6)}
                  </span>
                  <CopyButton text={token.address} />
                </span>
              </div>
            </div>
          </div>

          <Button asChild variant="outline" className="shrink-0">
            <Link href={`/tokens/${token.address}`}>
              View Details
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </GlassCard>
    </HoverLift>
  );
}

// ---------------------------------------------------------------------------
// Main token list
// ---------------------------------------------------------------------------

export function TokenList({ tokens, isLoading }: TokenListProps) {
  if (isLoading) {
    return <TokenListSkeleton />;
  }

  const featured = tokens.filter((t) => t.featured);
  const regular = tokens.filter((t) => !t.featured);

  return (
    <div className="space-y-6">
      {/* Featured tokens */}
      {featured.map((token, i) => (
        <motion.div
          key={token.address}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <FeaturedTokenCard token={token} />
        </motion.div>
      ))}

      {/* All tokens table */}
      {regular.length > 0 && (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 bg-muted/50">
                <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3">Token</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Symbol</th>
                  <th className="hidden px-4 py-3 md:table-cell">Standard</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Supply</th>
                  <th className="px-4 py-3">Contract</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {regular.map((token, i) => (
                  <motion.tr
                    key={token.address}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className="transition-colors hover:bg-muted/50"
                  >
                    {/* Token name with icon */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/tokens/${token.address}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <TokenIcon symbol={token.symbol} />
                        <div>
                          <span className="font-medium">{token.name}</span>
                          <span className="ml-2 text-muted-foreground sm:hidden">
                            ({token.symbol})
                          </span>
                        </div>
                      </Link>
                    </td>

                    {/* Symbol */}
                    <td className="hidden px-4 py-4 sm:table-cell">
                      <span className="font-mono font-medium">
                        {token.symbol}
                      </span>
                    </td>

                    {/* Standard */}
                    <td className="hidden px-4 py-4 md:table-cell">
                      <Badge variant="outline" className="text-[10px]">
                        {token.standard ?? "Unknown"}
                      </Badge>
                    </td>

                    {/* Supply */}
                    <td className="hidden px-4 py-4 text-muted-foreground lg:table-cell">
                      {formatTokenSupply(token.totalSupply, token.decimals)}
                    </td>

                    {/* Contract */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/address/${token.address}`}
                          className="font-mono text-xs text-integra-brand hover:underline"
                        >
                          {truncateAddress(token.address, 6)}
                        </Link>
                        <CopyButton text={token.address} />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Empty state when no tokens */}
      {tokens.length === 0 && (
        <GlassCard className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-muted-foreground">
            No tokens registered yet. Deploy an ERC-20 or ERC-721 to see it
            here.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
