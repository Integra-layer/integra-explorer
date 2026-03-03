"use client";

import {
  DollarSign,
  TrendingUp,
  Calendar,
  Landmark,
  Percent,
  ArrowUpRight,
} from "lucide-react";
import { GlassCard } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import type { ValuationInfo } from "@/lib/api/passport-types";

interface ValuationTabProps {
  data: ValuationInfo;
  fieldPrivacy?: Record<string, boolean>;
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ValuationTab({ data, fieldPrivacy }: ValuationTabProps) {
  const isPrivate = (field: string) =>
    fieldPrivacy?.[`valuation.${field}`] === true;

  return (
    <div className="space-y-6">
      {/* Status */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-integra-brand/10">
            <Landmark className="size-5 text-integra-brand" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Asset Status</p>
            <p className="text-lg font-semibold">{data.assetStatus}</p>
          </div>
        </div>
      </GlassCard>

      {/* Financial metrics grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Yield range */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-success/10">
              <Percent className="size-5 text-integra-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Annual Yield</p>
              <p className="text-xl font-bold">
                {data.minYield}% &ndash; {data.maxYield}%
              </p>
            </div>
          </div>
        </GlassCard>

        {/* ROI range */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-info/10">
              <ArrowUpRight className="size-5 text-integra-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected ROI</p>
              <p className="text-xl font-bold">
                {data.minRoi}% &ndash; {data.maxRoi}%
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Purchase price */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-warning/10">
              <DollarSign className="size-5 text-integra-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Purchase Price</p>
              <p className="text-xl font-bold">
                {formatCurrency(data.purchasePrice, data.currency)}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Debt */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-danger/10">
              <TrendingUp className="size-5 text-integra-danger" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Debt</p>
              {isPrivate("debt") ? (
                <Badge variant="secondary">Private</Badge>
              ) : (
                <p className="text-xl font-bold">
                  {formatCurrency(data.debt, data.currency)}
                </p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Payout, redemption, leverage details */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Calendar className="size-4 text-integra-brand" />
            <h4 className="text-sm font-semibold">Payout Schedule</h4>
          </div>
          <p className="text-sm text-muted-foreground">{data.payoutSchedule}</p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="size-4 text-integra-success" />
            <h4 className="text-sm font-semibold">Redemption</h4>
          </div>
          <p className="text-sm text-muted-foreground">{data.redemption}</p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Landmark className="size-4 text-integra-info" />
            <h4 className="text-sm font-semibold">Leverage</h4>
          </div>
          <p className="text-sm text-muted-foreground">{data.leverage}</p>
        </GlassCard>
      </div>
    </div>
  );
}
