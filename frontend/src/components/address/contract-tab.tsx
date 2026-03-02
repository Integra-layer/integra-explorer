"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GlassCard, SkeletonShimmer } from "@/components/effects";
import type { Contract } from "@/lib/api/types";

interface ContractTabProps {
  contract: Contract | undefined;
  isLoading: boolean;
}

function ContractSkeleton() {
  return (
    <GlassCard className="space-y-4 p-6">
      <SkeletonShimmer className="h-5 w-40" />
      <SkeletonShimmer className="h-4 w-24" />
      <Separator />
      <SkeletonShimmer className="h-4 w-32" />
      <SkeletonShimmer className="h-32 w-full" />
    </GlassCard>
  );
}

export function ContractTab({ contract, isLoading }: ContractTabProps) {
  const [abiExpanded, setAbiExpanded] = useState(false);
  const [abiCopied, setAbiCopied] = useState(false);

  if (isLoading) {
    return <ContractSkeleton />;
  }

  if (!contract) {
    return (
      <GlassCard className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">
          No contract information available
        </p>
      </GlassCard>
    );
  }

  const isVerified = contract.verificationStatus === "verified";
  const hasAbi = contract.abi && contract.abi.length > 0;
  const abiString = hasAbi ? JSON.stringify(contract.abi, null, 2) : null;

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
    <div className="space-y-4">
      {/* Contract Info */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          {/* Name & Verification */}
          <div className="flex flex-wrap items-center gap-3">
            {contract.name && (
              <h3 className="text-lg font-semibold">{contract.name}</h3>
            )}
            {isVerified ? (
              <Badge className="gap-1.5 bg-integra-success/10 text-integra-success hover:bg-integra-success/20">
                <CheckCircle className="size-3.5" />
                Verified
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1.5 text-muted-foreground"
              >
                <XCircle className="size-3.5" />
                Unverified
              </Badge>
            )}
          </div>

          {/* Token info */}
          {contract.tokenName && (
            <>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Token Name
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
                      {Number(contract.tokenTotalSupply).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Patterns */}
          {contract.patterns.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Detected Standards
                </p>
                <div className="flex flex-wrap gap-2">
                  {contract.patterns.map((pattern) => (
                    <Badge key={pattern} variant="secondary">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Proxy */}
          {contract.proxy && (
            <>
              <Separator />
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Proxy Implementation
                </p>
                <p className="font-mono text-sm text-integra-brand">
                  {contract.proxy}
                </p>
              </div>
            </>
          )}
        </div>
      </GlassCard>

      {/* ABI Section */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Contract ABI
          </h3>
          <div className="flex items-center gap-2">
            {hasAbi && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={copyAbi}
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
              </Button>
            )}
            {hasAbi && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => setAbiExpanded(!abiExpanded)}
              >
                {abiExpanded ? (
                  <>
                    <ChevronUp className="size-3.5" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5" />
                    Expand
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {hasAbi ? (
          <div
            className={`mt-3 overflow-hidden rounded-lg border border-border/50 bg-muted/30 transition-all ${
              abiExpanded ? "max-h-[600px]" : "max-h-40"
            }`}
          >
            <pre className="overflow-auto p-4 font-mono text-xs leading-relaxed">
              {abiString}
            </pre>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {isVerified
              ? "ABI not available"
              : "This contract is not verified. Submit the source code to view the ABI."}
          </p>
        )}
      </GlassCard>
    </div>
  );
}
