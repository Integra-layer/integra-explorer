"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileCode, CheckCircle, XCircle, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  PageTransition,
  GlassCard,
  SkeletonShimmer,
  CopyButton,
} from "@/components/effects";
import { DetailRow } from "@/components/ui/detail-row";
import { ReadContract } from "@/components/contracts/read-contract";
import { WriteContract } from "@/components/contracts/write-contract";
import { ContractEvents } from "@/components/contracts/contract-events";
import {
  getContract,
  parseAbiFunctions,
  parseAbiEvents,
} from "@/lib/api/contracts";
import { truncateAddress } from "@/lib/format";
import { useExplorerReady } from "@/lib/explorer-provider";

interface ContractPageProps {
  params: Promise<{ address: string }>;
}

type TabId = "overview" | "read" | "write" | "events" | "abi";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "read", label: "Read Contract" },
  { id: "write", label: "Write Contract" },
  { id: "events", label: "Events" },
  { id: "abi", label: "ABI" },
];

function ContractDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SkeletonShimmer className="size-6 rounded-full" />
        <SkeletonShimmer className="h-7 w-80" />
      </div>
      <GlassCard className="space-y-4 p-6">
        <SkeletonShimmer className="h-4 w-40" />
        <SkeletonShimmer className="h-4 w-64" />
        <SkeletonShimmer className="h-4 w-32" />
      </GlassCard>
    </div>
  );
}

export default function ContractDetailPage({ params }: ContractPageProps) {
  const { address } = use(params);
  const isReady = useExplorerReady();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [abiCopied, setAbiCopied] = useState(false);

  const { data: contract, isLoading } = useQuery({
    queryKey: ["contract", address],
    queryFn: () => getContract(address),
    enabled: isReady && !!address,
    refetchInterval: 60_000,
  });

  const isVerified =
    contract?.verificationStatus === "verified" ||
    contract?.verificationStatus === "success";
  const allFunctions = parseAbiFunctions(contract?.abi ?? null);
  const allEvents = parseAbiEvents(contract?.abi ?? null);
  const abiString = contract?.abi
    ? JSON.stringify(contract.abi, null, 2)
    : null;

  async function copyAbi() {
    if (!abiString) return;
    try {
      await navigator.clipboard.writeText(abiString);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = abiString;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setAbiCopied(true);
    setTimeout(() => setAbiCopied(false), 2000);
  }

  return (
    <PageTransition>
      <section className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* ---------------------------------------------------------------- */}
          {/* Header */}
          {/* ---------------------------------------------------------------- */}
          {isLoading ? (
            <ContractDetailSkeleton />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <FileCode className="size-6 text-integra-brand" />
                <h1 className="text-2xl font-bold tracking-tight font-mono">
                  <span className="hidden md:inline">{address}</span>
                  <span className="md:hidden">
                    {truncateAddress(address, 8)}
                  </span>
                </h1>
                <CopyButton text={address} />
                {contract?.name && (
                  <Badge variant="secondary" className="text-sm font-medium">
                    {contract.name}
                  </Badge>
                )}
                {isVerified ? (
                  <Badge className="gap-1.5 bg-integra-success/10 text-integra-success hover:bg-integra-success/20">
                    <CheckCircle className="size-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1.5 text-muted-foreground"
                  >
                    <XCircle className="size-3" />
                    Unverified
                  </Badge>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* Tabs */}
              {/* ------------------------------------------------------------ */}
              <div className="border-b border-border/50">
                <nav className="-mb-px flex gap-1 overflow-x-auto">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={[
                        "whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                        activeTab === tab.id
                          ? "border-integra-brand text-integra-brand"
                          : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                      ].join(" ")}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* Tab panels */}
              {/* ------------------------------------------------------------ */}

              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <GlassCard className="p-6 space-y-4">
                    <DetailRow label="Address">
                      <div className="flex items-center gap-2 font-mono text-sm break-all">
                        {address}
                        <CopyButton text={address} />
                      </div>
                    </DetailRow>

                    {contract?.name && (
                      <>
                        <Separator />
                        <DetailRow label="Contract Name">
                          <span className="text-sm font-medium">
                            {contract.name}
                          </span>
                        </DetailRow>
                      </>
                    )}

                    <Separator />
                    <DetailRow label="Verification Status">
                      {isVerified ? (
                        <Badge className="gap-1.5 bg-integra-success/10 text-integra-success hover:bg-integra-success/20">
                          <CheckCircle className="size-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1.5 text-muted-foreground"
                        >
                          <XCircle className="size-3" />
                          Unverified
                        </Badge>
                      )}
                    </DetailRow>

                    {contract?.proxy && (
                      <>
                        <Separator />
                        <DetailRow label="Proxy Implementation">
                          <span className="font-mono text-sm text-integra-brand break-all">
                            {contract.proxy}
                          </span>
                        </DetailRow>
                      </>
                    )}
                  </GlassCard>

                  {/* Token metadata */}
                  {contract?.tokenName && (
                    <GlassCard className="p-6">
                      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Token Metadata
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Name
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {contract.tokenName}
                          </p>
                        </div>
                        {contract.tokenSymbol && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Symbol
                            </p>
                            <p className="mt-1 text-sm font-medium">
                              {contract.tokenSymbol}
                            </p>
                          </div>
                        )}
                        {contract.tokenDecimals !== null && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Decimals
                            </p>
                            <p className="mt-1 text-sm font-medium">
                              {contract.tokenDecimals}
                            </p>
                          </div>
                        )}
                        {contract.tokenTotalSupply && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Total Supply
                            </p>
                            <p className="mt-1 text-sm font-medium">
                              {Number(
                                contract.tokenTotalSupply,
                              ).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  )}

                  {/* Detected standards */}
                  {contract && contract.patterns.length > 0 && (
                    <GlassCard className="p-6">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Detected Standards
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {contract.patterns.map((pattern) => (
                          <Badge key={pattern} variant="secondary">
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </GlassCard>
                  )}
                </div>
              )}

              {/* READ CONTRACT */}
              {activeTab === "read" && (
                <ReadContract
                  functions={allFunctions}
                  contractAddress={address}
                />
              )}

              {/* WRITE CONTRACT */}
              {activeTab === "write" && (
                <WriteContract
                  functions={allFunctions}
                  contractAddress={address}
                />
              )}

              {/* EVENTS */}
              {activeTab === "events" && <ContractEvents events={allEvents} />}

              {/* ABI */}
              {activeTab === "abi" && (
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      Contract ABI
                    </p>
                    {abiString && (
                      <button
                        type="button"
                        onClick={copyAbi}
                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                      >
                        {abiCopied ? (
                          <>
                            <Check className="size-3.5 text-integra-success" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            Copy ABI
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {abiString ? (
                    <div className="overflow-hidden rounded-lg border border-border/50 bg-muted/30 max-h-[600px]">
                      <pre className="overflow-auto p-4 font-mono text-xs leading-relaxed">
                        {abiString}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isVerified
                        ? "ABI not available."
                        : "This contract is not verified. Submit the source code to view the ABI."}
                    </p>
                  )}
                </GlassCard>
              )}
            </>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
