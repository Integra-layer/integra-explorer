"use client";

import { ExternalLink, Shield, ShieldAlert, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DetailRow } from "@/components/ui/detail-row";
import { GlassCard, CopyButton, SkeletonShimmer } from "@/components/effects";
import {
  truncateAddress,
  formatStakedIRL,
  formatCommission,
} from "@/lib/format";
import { bech32ToEvmAddress } from "@/lib/bech32";
import type { CosmosValidator, CosmosDelegation } from "@/lib/api/types";

interface ValidatorDetailProps {
  validator: CosmosValidator | undefined;
  delegations: CosmosDelegation[] | undefined;
  isLoading: boolean;
}

function getStatusBadge(validator: CosmosValidator) {
  if (validator.jailed) {
    return (
      <Badge className="gap-1 bg-integra-danger/10 text-integra-danger">
        <ShieldOff className="size-3" />
        Jailed
      </Badge>
    );
  }
  if (validator.status === "BOND_STATUS_BONDED") {
    return (
      <Badge className="gap-1 bg-integra-success/10 text-integra-success">
        <Shield className="size-3" />
        Active
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-integra-warning/10 text-integra-warning">
      <ShieldAlert className="size-3" />
      Inactive
    </Badge>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SkeletonShimmer width={200} height={32} />
        <SkeletonShimmer width={80} height={24} className="rounded-full" />
      </div>
      <SkeletonShimmer className="h-72 rounded-xl" />
      <SkeletonShimmer className="h-48 rounded-xl" />
    </div>
  );
}

export function ValidatorDetail({
  validator,
  delegations,
  isLoading,
}: ValidatorDetailProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!validator) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Shield className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">Validator Not Found</h2>
        <p className="text-muted-foreground">
          This validator address could not be loaded.
        </p>
      </div>
    );
  }

  const { commission_rates } = validator.commission;
  const evmAddress = bech32ToEvmAddress(validator.operator_address);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Shield className="size-6 text-integra-brand" />
        <h1 className="text-2xl font-bold tracking-tight">
          {validator.description.moniker || "Unknown Validator"}
        </h1>
        {getStatusBadge(validator)}
      </div>

      {/* Summary card */}
      <GlassCard className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Operator Address */}
          <div className="sm:col-span-2">
            <DetailRow variant="inline" label="Operator Address">
              <span className="inline-flex items-center gap-1">
                <span className="hidden md:inline font-mono">
                  {validator.operator_address}
                </span>
                <span className="md:hidden font-mono">
                  {truncateAddress(validator.operator_address, 10)}
                </span>
                <CopyButton text={validator.operator_address} />
              </span>
            </DetailRow>
          </div>

          {evmAddress && (
            <div className="sm:col-span-2">
              <DetailRow variant="inline" label="EVM Address">
                <span className="inline-flex items-center gap-1">
                  <span className="hidden md:inline font-mono">
                    {evmAddress}
                  </span>
                  <span className="md:hidden font-mono">
                    {truncateAddress(evmAddress, 10)}
                  </span>
                  <CopyButton text={evmAddress} />
                </span>
              </DetailRow>
            </div>
          )}

          <DetailRow variant="inline" label="Status">
            {validator.jailed
              ? "Jailed"
              : validator.status === "BOND_STATUS_BONDED"
                ? "Active (Bonded)"
                : validator.status === "BOND_STATUS_UNBONDING"
                  ? "Unbonding"
                  : "Unbonded"}
          </DetailRow>

          <DetailRow variant="inline" label="Tokens Staked">
            {formatStakedIRL(validator.tokens)} IRL
          </DetailRow>

          <DetailRow variant="inline" label="Commission Rate">
            {formatCommission(commission_rates.rate)}
          </DetailRow>

          <DetailRow variant="inline" label="Max Commission">
            {formatCommission(commission_rates.max_rate)}
          </DetailRow>

          <DetailRow variant="inline" label="Max Commission Change">
            {formatCommission(commission_rates.max_change_rate)}
          </DetailRow>

          <DetailRow variant="inline" label="Min Self Delegation">
            {validator.min_self_delegation}
          </DetailRow>

          {validator.description.website && (
            <DetailRow variant="inline" label="Website">
              <a
                href={validator.description.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-integra-brand hover:underline"
              >
                {validator.description.website}
                <ExternalLink className="size-3" />
              </a>
            </DetailRow>
          )}

          {validator.unbonding_height !== "0" && (
            <DetailRow variant="inline" label="Unbonding Height">
              {validator.unbonding_height}
            </DetailRow>
          )}

          {validator.description.details && (
            <div className="sm:col-span-2">
              <DetailRow variant="inline" label="Details">
                {validator.description.details}
              </DetailRow>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Delegators section */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          Delegators
          {delegations && delegations.length > 0 && (
            <Badge variant="secondary" className="font-mono">
              {delegations.length}
            </Badge>
          )}
        </h2>

        {!delegations || delegations.length === 0 ? (
          <GlassCard className="p-6">
            <p className="text-center text-muted-foreground">
              No delegators found.
            </p>
          </GlassCard>
        ) : (
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Delegator Address
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Shares
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {delegations.map((d) => (
                    <tr
                      key={d.delegation.delegator_address}
                      className="border-b border-border/50 transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-mono">
                          <span className="hidden lg:inline">
                            {d.delegation.delegator_address}
                          </span>
                          <span className="lg:hidden">
                            {truncateAddress(d.delegation.delegator_address, 8)}
                          </span>
                          <CopyButton text={d.delegation.delegator_address} />
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {formatStakedIRL(d.delegation.shares)}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {formatStakedIRL(d.balance.amount)} IRL
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
