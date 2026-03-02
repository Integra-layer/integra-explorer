"use client";

import Link from "next/link";
import { Users, UserCheck, Wallet } from "lucide-react";
import { GlassCard, CopyButton } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import { truncateAddress } from "@/lib/format";
import type { StakeholderInfo } from "@/lib/api/passport-types";

interface StakeholderTabProps {
  data: StakeholderInfo;
  fieldPrivacy?: Record<string, boolean>;
}

const partyTypeColors: Record<string, string> = {
  token_issuer: "bg-integra-brand/10 text-integra-brand",
  property_manager: "bg-integra-info/10 text-integra-info",
  legal_counsel: "bg-amber-500/10 text-amber-500",
  auditor: "bg-integra-success/10 text-integra-success",
  regulator: "bg-red-500/10 text-red-500",
};

function formatPartyType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function StakeholderTab({ data, fieldPrivacy }: StakeholderTabProps) {
  const isOwnershipPrivate =
    fieldPrivacy?.["stakeholders.ownerships"] === true;

  return (
    <div className="space-y-6">
      {/* Ownership table */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-integra-brand/10">
            <Wallet className="size-5 text-integra-brand" />
          </div>
          <h3 className="text-lg font-semibold">Ownership Distribution</h3>
          <Badge variant="secondary">
            {data.ownerships.length} holders
          </Badge>
        </div>

        {isOwnershipPrivate ? (
          <div className="flex items-center justify-center py-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              Ownership data is private
            </Badge>
          </div>
        ) : data.ownerships.length > 0 ? (
          <div className="space-y-4">
            {/* Visual bar chart */}
            <div className="flex h-6 w-full overflow-hidden rounded-full">
              {data.ownerships.map((owner, i) => {
                const colors = [
                  "bg-integra-brand",
                  "bg-integra-info",
                  "bg-integra-success",
                  "bg-amber-500",
                  "bg-red-500",
                ];
                return (
                  <div
                    key={i}
                    className={`${colors[i % colors.length]} transition-all duration-500`}
                    style={{ width: `${owner.percentage}%` }}
                    title={`${truncateAddress(owner.walletAddress)}: ${owner.percentage}%`}
                  />
                );
              })}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Wallet
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Ownership
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Purchase Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.ownerships.map((owner, i) => (
                    <tr
                      key={i}
                      className="border-b border-muted/50 last:border-0"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/address/${owner.walletAddress}`}
                            className="font-mono text-sm text-integra-brand hover:underline"
                          >
                            {truncateAddress(owner.walletAddress)}
                          </Link>
                          <CopyButton text={owner.walletAddress} />
                        </div>
                      </td>
                      <td className="py-3 text-right font-semibold">
                        {owner.percentage}%
                      </td>
                      <td className="py-3 text-right font-mono">
                        {owner.purchasePrice.toLocaleString()}{" "}
                        {owner.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No ownership data available.
          </p>
        )}
      </GlassCard>

      {/* Involved parties */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-integra-info/10">
            <Users className="size-5 text-integra-info" />
          </div>
          <h3 className="text-lg font-semibold">Involved Parties</h3>
          <Badge variant="secondary">
            {data.involvedParties.length} parties
          </Badge>
        </div>

        {data.involvedParties.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.involvedParties.map((party, i) => (
              <div
                key={i}
                className="rounded-lg border border-muted p-4 transition-colors hover:bg-muted/30"
              >
                <div className="mb-2 flex items-center gap-2">
                  <UserCheck
                    className={`size-4 ${partyTypeColors[party.type]?.split(" ")[1] || "text-muted-foreground"}`}
                  />
                  <p className="font-semibold">{party.name}</p>
                </div>
                <Badge
                  variant="outline"
                  className={partyTypeColors[party.type] || ""}
                >
                  {formatPartyType(party.type)}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  {party.role}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {party.did}
                  </p>
                  <CopyButton text={party.did} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No involved parties listed.
          </p>
        )}
      </GlassCard>
    </div>
  );
}
