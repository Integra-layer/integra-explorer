"use client";

import Link from "next/link";
import { Search, FileCode, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard, SkeletonShimmer } from "@/components/effects";
import { PageTransition } from "@/components/effects";
import { useSearch } from "@/lib/hooks/use-search";
import { truncateAddress } from "@/lib/format";
import type { Contract } from "@/lib/api/types";
import type { KnownToken } from "@/lib/api/tokens";

// ---------------------------------------------------------------------------
// Skeleton row for loading state
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <tr className="border-b border-border/30 last:border-0">
      <td className="px-4 py-3">
        <SkeletonShimmer className="h-4 w-36" />
      </td>
      <td className="px-4 py-3">
        <SkeletonShimmer className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <SkeletonShimmer className="h-5 w-16" />
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Contracts section
// ---------------------------------------------------------------------------

function ContractsSection({ contracts }: { contracts: Contract[] }) {
  if (contracts.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileCode className="size-4 text-integra-brand" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Contracts
        </h2>
        <Badge variant="secondary" className="font-mono text-xs">
          {contracts.length}
        </Badge>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Token
                </th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="border-b border-border/30 transition-colors last:border-0 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/contracts/${contract.address}`}
                      className="font-mono text-sm text-integra-brand hover:underline"
                    >
                      <span className="hidden md:inline">
                        {truncateAddress(contract.address, 6)}
                      </span>
                      <span className="md:hidden">
                        {truncateAddress(contract.address, 4)}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {contract.name ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {contract.tokenSymbol ? (
                      <span className="text-integra-brand">
                        {contract.tokenSymbol}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tokens section
// ---------------------------------------------------------------------------

function TokensSection({ tokens }: { tokens: KnownToken[] }) {
  if (tokens.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Coins className="size-4 text-integra-brand" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Tokens
        </h2>
        <Badge variant="secondary" className="font-mono text-xs">
          {tokens.length}
        </Badge>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Symbol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Standard
                </th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr
                  key={token.address}
                  className="border-b border-border/30 transition-colors last:border-0 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/tokens/${token.address}`}
                      className="font-mono text-sm text-integra-brand hover:underline"
                    >
                      <span className="hidden md:inline">
                        {truncateAddress(token.address, 6)}
                      </span>
                      <span className="md:hidden">
                        {truncateAddress(token.address, 4)}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {token.name}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-integra-brand">
                    {token.symbol}
                  </td>
                  <td className="px-4 py-3">
                    {token.standard ? (
                      <Badge variant="secondary" className="text-xs">
                        {token.standard}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SearchSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1].map((i) => (
        <div key={i} className="space-y-3">
          <SkeletonShimmer className="h-5 w-32" />
          <GlassCard className="overflow-hidden">
            <table className="w-full">
              <tbody>
                {Array.from({ length: 4 }).map((_, j) => (
                  <SkeletonRow key={j} />
                ))}
              </tbody>
            </table>
          </GlassCard>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

interface SearchClientProps {
  query: string;
}

export function SearchClient({ query }: SearchClientProps) {
  const { contracts, tokens, isLoading, error } = useSearch(query);

  const hasResults = contracts.length > 0 || tokens.length > 0;

  return (
    <PageTransition>
      <section className="container mx-auto space-y-6 px-4 py-8">
        {/* Page heading */}
        <div className="flex items-center gap-3">
          <Search className="size-6 text-integra-brand" />
          <h1 className="text-2xl font-bold tracking-tight">Search Results</h1>
          {query && (
            <span className="font-mono text-sm text-muted-foreground">
              &ldquo;{query}&rdquo;
            </span>
          )}
        </div>

        {/* No query state */}
        {!query && (
          <GlassCard className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">
              Enter a search term to find contracts or tokens.
            </p>
          </GlassCard>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Search failed. Please try again.
          </div>
        )}

        {/* Loading skeleton */}
        {query && isLoading && <SearchSkeleton />}

        {/* Results */}
        {query && !isLoading && (
          <div className="space-y-8">
            <ContractsSection contracts={contracts} />
            <TokensSection tokens={tokens} />

            {/* No results */}
            {!hasResults && (
              <GlassCard className="flex flex-col items-center justify-center gap-3 py-16">
                <Search className="size-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">
                  No results found for &ldquo;{query}&rdquo;.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Try searching for a contract name, token name, or symbol.
                </p>
              </GlassCard>
            )}
          </div>
        )}
      </section>
    </PageTransition>
  );
}
