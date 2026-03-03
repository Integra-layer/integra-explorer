"use client";

import Link from "next/link";
import {
  History,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { GlassCard, CopyButton } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import { truncateAddress, truncateHash, timeAgo } from "@/lib/format";
import type { HistoryInfo } from "@/lib/api/passport-types";

interface HistoryTabProps {
  data: HistoryInfo;
}

const txStatusConfig = {
  success: {
    icon: CheckCircle2,
    label: "Success",
    badgeClass:
      "bg-integra-success/10 text-integra-success border-integra-success/30",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    badgeClass:
      "bg-integra-warning/10 text-integra-warning border-integra-warning/30",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    badgeClass:
      "bg-integra-danger/10 text-integra-danger border-integra-danger/30",
  },
};

export function HistoryTab({ data }: HistoryTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-integra-brand/10">
            <History className="size-5 text-integra-brand" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Transaction History</p>
            <p className="text-xl font-bold">{data.transactions.length}</p>
          </div>
        </div>
      </GlassCard>

      {/* Transaction list */}
      {data.transactions.length > 0 ? (
        <GlassCard className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted">
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Tx Hash
                  </th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    From
                  </th>
                  <th className="pb-3 text-center font-medium text-muted-foreground" />
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    To
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Block
                  </th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((tx, i) => {
                  const config = txStatusConfig[tx.status];
                  const StatusIcon = config.icon;
                  const fromDisplay = tx.fromDid || tx.fromAddress || "—";
                  const toDisplay = tx.toDid || tx.toAddress || "—";

                  return (
                    <tr
                      key={i}
                      className="border-b border-muted/50 last:border-0"
                    >
                      {/* Tx Hash */}
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/transactions/${tx.hash}`}
                            className="font-mono text-xs text-integra-brand hover:underline"
                          >
                            {truncateHash(tx.hash)}
                          </Link>
                          <CopyButton text={tx.hash} />
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3">
                        <Badge variant="secondary" className="text-xs">
                          {tx.type}
                        </Badge>
                      </td>

                      {/* From */}
                      <td className="py-3">
                        {tx.fromAddress ? (
                          <Link
                            href={`/address/${tx.fromAddress}`}
                            className="font-mono text-xs text-integra-brand hover:underline"
                          >
                            {truncateAddress(tx.fromAddress)}
                          </Link>
                        ) : tx.fromDid ? (
                          <span
                            className="font-mono text-xs"
                            title={tx.fromDid}
                          >
                            {tx.fromDid.length > 20
                              ? `${tx.fromDid.slice(0, 20)}...`
                              : tx.fromDid}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>

                      {/* Arrow */}
                      <td className="py-3 text-center">
                        {(fromDisplay !== "—" || toDisplay !== "—") && (
                          <ArrowRight className="mx-auto size-3.5 text-muted-foreground" />
                        )}
                      </td>

                      {/* To */}
                      <td className="py-3">
                        {tx.toAddress ? (
                          <Link
                            href={`/address/${tx.toAddress}`}
                            className="font-mono text-xs text-integra-brand hover:underline"
                          >
                            {truncateAddress(tx.toAddress)}
                          </Link>
                        ) : tx.toDid ? (
                          <span className="font-mono text-xs" title={tx.toDid}>
                            {tx.toDid.length > 20
                              ? `${tx.toDid.slice(0, 20)}...`
                              : tx.toDid}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 text-right font-mono text-xs">
                        {Number(tx.amount).toLocaleString()}
                      </td>

                      {/* Block */}
                      <td className="py-3 text-right">
                        <Link
                          href={`/blocks/${tx.blockNumber}`}
                          className="font-mono text-xs text-integra-brand hover:underline"
                        >
                          {tx.blockNumber.toLocaleString()}
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="py-3 text-center">
                        <Badge variant="outline" className={config.badgeClass}>
                          <StatusIcon className="mr-1 size-3" />
                          {config.label}
                        </Badge>
                      </td>

                      {/* Time */}
                      <td className="py-3 text-right text-xs text-muted-foreground">
                        {timeAgo(tx.timestamp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <History className="mb-2 size-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              No transaction history available.
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
