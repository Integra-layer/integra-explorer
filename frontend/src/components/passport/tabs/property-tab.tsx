"use client";

import { LayoutGrid, TrendingUp, AlertTriangle, Home } from "lucide-react";
import { GlassCard } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import type { PropertyInfo } from "@/lib/api/passport-types";

interface PropertyTabProps {
  data: PropertyInfo;
}

export function PropertyTab({ data }: PropertyTabProps) {
  return (
    <div className="space-y-6">
      {/* Structuring overview */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-integra-brand/10">
            <LayoutGrid className="size-5 text-integra-brand" />
          </div>
          <h3 className="text-lg font-semibold">Structuring Overview</h3>
        </div>
        <p className="leading-relaxed text-muted-foreground">
          {data.structuringOverview}
        </p>
      </GlassCard>

      {/* Return profile & transfer restrictions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="size-4 text-integra-success" />
            <h4 className="font-semibold">Return Profile</h4>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.returnProfile}
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500" />
            <h4 className="font-semibold">Transfer Restrictions</h4>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.transferRestrictions}
          </p>
        </GlassCard>
      </div>

      {/* Unit mixes table */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-integra-info/10">
            <Home className="size-5 text-integra-info" />
          </div>
          <h3 className="text-lg font-semibold">Unit Mixes</h3>
          <Badge variant="secondary">{data.unitMixes.length} types</Badge>
        </div>

        {data.unitMixes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted">
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Unit Type
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Beds
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Baths
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Space (sqm)
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.unitMixes.map((unit, i) => (
                  <tr
                    key={i}
                    className="border-b border-muted/50 last:border-0"
                  >
                    <td className="py-3 font-medium">{unit.unitType}</td>
                    <td className="py-3 text-right">
                      {unit.beds === 0 ? "Studio" : unit.beds}
                    </td>
                    <td className="py-3 text-right">{unit.baths}</td>
                    <td className="py-3 text-right font-mono">
                      {unit.space.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono">{unit.count}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-muted">
                  <td className="pt-3 font-semibold" colSpan={4}>
                    Total Units
                  </td>
                  <td className="pt-3 text-right font-mono font-semibold">
                    {data.unitMixes
                      .reduce((sum, u) => sum + u.count, 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No unit mix data available.
          </p>
        )}
      </GlassCard>

      {/* Valuation history */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-integra-success/10">
            <TrendingUp className="size-5 text-integra-success" />
          </div>
          <h3 className="text-lg font-semibold">Valuation History</h3>
        </div>

        {data.valuations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted">
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Value
                  </th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Currency
                  </th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Appraiser
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.valuations.map((val, i) => (
                  <tr
                    key={i}
                    className="border-b border-muted/50 last:border-0"
                  >
                    <td className="py-3">
                      {new Date(val.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right font-mono">
                      {val.value.toLocaleString()}
                    </td>
                    <td className="py-3">{val.currency}</td>
                    <td className="py-3">{val.appraiser}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No valuation history available.
          </p>
        )}
      </GlassCard>
    </div>
  );
}
