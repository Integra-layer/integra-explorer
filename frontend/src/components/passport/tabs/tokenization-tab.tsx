"use client";

import Link from "next/link";
import {
  Coins,
  Link2,
  Layers,
  DollarSign,
  Wallet,
  BarChart3,
} from "lucide-react";
import { GlassCard, CopyButton } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import { truncateAddress } from "@/lib/format";
import type { TokenizationInfo } from "@/lib/api/passport-types";

interface TokenizationTabProps {
  data: TokenizationInfo;
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function TokenizationTab({ data }: TokenizationTabProps) {
  return (
    <div className="space-y-6">
      {/* Token standard + chain */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-brand/10">
              <Layers className="size-5 text-integra-brand" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Token Standard</p>
              <Badge variant="outline" className="mt-1 text-sm font-semibold">
                {data.standard}
              </Badge>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-info/10">
              <Link2 className="size-5 text-integra-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chain</p>
              <p className="font-semibold">{data.chain}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-success/10">
              <BarChart3 className="size-5 text-integra-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Tokenized Percentage
              </p>
              <p className="text-xl font-bold">{data.tokenizedPercentage}%</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Contract details */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-integra-brand/10">
            <Coins className="size-5 text-integra-brand" />
          </div>
          <h3 className="text-lg font-semibold">Token Details</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Contract Address</p>
            <div className="flex items-center gap-2">
              <Link
                href={`/address/${data.contractAddress}`}
                className="font-mono text-sm text-integra-brand hover:underline"
              >
                {truncateAddress(data.contractAddress, 8)}
              </Link>
              <CopyButton text={data.contractAddress} />
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Owner Wallet</p>
            <div className="flex items-center gap-2">
              <Link
                href={`/address/${data.ownerWallet}`}
                className="font-mono text-sm text-integra-brand hover:underline"
              >
                {truncateAddress(data.ownerWallet, 8)}
              </Link>
              <CopyButton text={data.ownerWallet} />
            </div>
          </div>

          {data.tokenId && (
            <div>
              <p className="text-sm text-muted-foreground">Token ID</p>
              <p className="font-mono text-sm font-medium">{data.tokenId}</p>
            </div>
          )}

          {data.subTokenId && (
            <div>
              <p className="text-sm text-muted-foreground">Sub-Token ID</p>
              <p className="font-mono text-sm font-medium">
                {data.subTokenId}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Total Supply</p>
            <p className="font-mono text-sm font-medium">
              {Number(data.totalSupply).toLocaleString()} tokens
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Financial summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <DollarSign className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valuation</p>
              <p className="text-xl font-bold">
                {formatCurrency(data.valuation, data.currency)}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-success/10">
              <Wallet className="size-5 text-integra-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="text-xl font-bold">
                {formatCurrency(data.marketCap, data.currency)}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
