"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FileCode, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  PageTransition,
  GlassCard,
  SkeletonShimmer,
} from "@/components/effects";
import { getContracts } from "@/lib/api/contracts";
import { truncateAddress } from "@/lib/format";
import { useExplorerReady } from "@/lib/explorer-provider";

const ITEMS_PER_PAGE = 25;

function ContractsTableSkeleton() {
  return (
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
                Standards
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Verified
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Token
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-border/30 last:border-0">
                <td className="px-4 py-3">
                  <SkeletonShimmer className="h-4 w-36" />
                </td>
                <td className="px-4 py-3">
                  <SkeletonShimmer className="h-4 w-24" />
                </td>
                <td className="px-4 py-3">
                  <SkeletonShimmer className="h-5 w-16" />
                </td>
                <td className="px-4 py-3">
                  <SkeletonShimmer className="h-5 w-20" />
                </td>
                <td className="px-4 py-3">
                  <SkeletonShimmer className="h-4 w-12" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function ContractsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isReady = useExplorerReady();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading } = useQuery({
    queryKey: ["contracts", page, ITEMS_PER_PAGE],
    queryFn: () => getContracts(page, ITEMS_PER_PAGE),
    enabled: isReady,
    refetchInterval: 30_000,
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const contracts = data?.items ?? [];

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/contracts?${params.toString()}`);
  }

  return (
    <PageTransition>
      <section className="container mx-auto space-y-6 px-4 py-8">
        {/* Page heading */}
        <div className="flex items-center gap-3">
          <FileCode className="size-6 text-integra-brand" />
          <h1 className="text-2xl font-bold tracking-tight">Contracts</h1>
          {total > 0 && (
            <Badge variant="secondary" className="font-mono">
              {total.toLocaleString()}
            </Badge>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <ContractsTableSkeleton />
        ) : contracts.length === 0 ? (
          <GlassCard className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">No contracts indexed yet.</p>
          </GlassCard>
        ) : (
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
                      Standards
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Verified
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Token
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => {
                    const isVerified =
                      contract.verificationStatus === "verified" ||
                      contract.verificationStatus === "success" ||
                      contract.verification != null;
                    return (
                      <tr
                        key={contract.id}
                        className="border-b border-border/30 transition-colors last:border-0 hover:bg-white/5"
                      >
                        {/* Address */}
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

                        {/* Name */}
                        <td className="px-4 py-3 text-sm text-foreground">
                          {contract.name ?? (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Standards / patterns */}
                        <td className="px-4 py-3">
                          {contract.patterns.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {contract.patterns.map((p) => (
                                <Badge
                                  key={p}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {p}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>

                        {/* Verification */}
                        <td className="px-4 py-3">
                          {isVerified ? (
                            <Badge className="gap-1 bg-integra-success/10 text-integra-success hover:bg-integra-success/20">
                              <CheckCircle className="size-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="gap-1 text-muted-foreground"
                            >
                              <XCircle className="size-3" />
                              Unverified
                            </Badge>
                          )}
                        </td>

                        {/* Token symbol */}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </section>
    </PageTransition>
  );
}

export default function ContractsPage() {
  return (
    <Suspense>
      <ContractsPageContent />
    </Suspense>
  );
}
