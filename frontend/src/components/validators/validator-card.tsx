"use client";

import Link from "next/link";
import { Shield, ShieldAlert, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HoverLift } from "@/components/effects";
import { formatStakedIRL, formatCommission } from "@/lib/format";
import type { CosmosValidator } from "@/lib/api/types";

interface ValidatorCardProps {
  validator: CosmosValidator;
  totalBonded: string;
}

function getStatusInfo(validator: CosmosValidator) {
  if (validator.jailed) {
    return {
      label: "Jailed",
      color: "bg-integra-danger/10 text-integra-danger",
      icon: ShieldOff,
    };
  }
  if (validator.status === "BOND_STATUS_BONDED") {
    return {
      label: "Active",
      color: "bg-integra-success/10 text-integra-success",
      icon: Shield,
    };
  }
  return {
    label: "Inactive",
    color: "bg-integra-warning/10 text-integra-warning",
    icon: ShieldAlert,
  };
}

export function ValidatorCard({ validator, totalBonded }: ValidatorCardProps) {
  const status = getStatusInfo(validator);
  const StatusIcon = status.icon;

  const votingPower =
    Number(totalBonded) > 0
      ? (Number(validator.tokens) / Number(totalBonded)) * 100
      : 0;

  return (
    <Link href={`/validators/${validator.operator_address}`}>
      <HoverLift className="h-full rounded-xl">
        <Card className="h-full cursor-pointer transition-colors hover:border-integra-brand/30">
          <CardContent className="space-y-4">
            {/* Header: Moniker + Status */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-lg font-bold">
                {validator.description.moniker || "Unknown"}
              </h3>
              <Badge className={`shrink-0 gap-1 ${status.color}`}>
                <StatusIcon className="size-3" />
                {status.label}
              </Badge>
            </div>

            {/* Voting Power */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Voting Power</span>
                <span className="font-mono font-medium">
                  {votingPower.toFixed(2)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-integra-brand transition-all duration-500"
                  style={{ width: `${Math.min(votingPower, 100)}%` }}
                />
              </div>
            </div>

            {/* Commission + Tokens */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Commission</span>
                <p className="font-mono font-medium">
                  {formatCommission(validator.commission.commission_rates.rate)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Staked</span>
                <p className="font-mono font-medium">
                  {formatStakedIRL(validator.tokens)} IRL
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </HoverLift>
    </Link>
  );
}
