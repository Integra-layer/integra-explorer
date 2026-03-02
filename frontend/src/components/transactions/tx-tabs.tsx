"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GlassCard } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import { truncateAddress, formatIRL } from "@/lib/format";
import type { Transaction } from "@/lib/api/types";

interface TxTabsProps {
  transaction: Transaction;
}

// ---------------------------------------------------------------------------
// Tab 1: Overview
// ---------------------------------------------------------------------------

function OverviewTab({ transaction: tx }: { transaction: Transaction }) {
  const fromAddr = truncateAddress(tx.from, 6);
  const toAddr = tx.to ? truncateAddress(tx.to, 6) : null;
  const value = formatIRL(tx.value);
  const isContractCreation = !tx.to;
  const hasMethod =
    tx.methodDetails?.label && tx.methodDetails.label !== "Transfer";

  let description: string;
  if (isContractCreation) {
    const contractAddr = tx.receipt?.contractAddress
      ? truncateAddress(tx.receipt.contractAddress, 6)
      : "a new contract";
    description = `Address ${fromAddr} created contract at ${contractAddr}`;
  } else if (hasMethod) {
    description = `Address ${fromAddr} called ${tx.methodDetails!.label} on ${toAddr} with ${value}`;
  } else {
    description = `Address ${fromAddr} sent ${value} to Address ${toAddr}`;
  }

  return (
    <GlassCard className="space-y-4 p-5">
      <p className="text-sm leading-relaxed">{description}</p>

      <div className="space-y-2">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Key Facts
        </h4>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>
            Transaction type:{" "}
            <span className="text-foreground">
              {tx.type === 0
                ? "Legacy"
                : tx.type === 2
                  ? "EIP-1559"
                  : `Type ${tx.type}`}
            </span>
          </li>
          <li>
            Nonce: <span className="font-mono text-foreground">{tx.nonce}</span>
          </li>
          <li>
            Position in block:{" "}
            <span className="text-foreground">{tx.transactionIndex}</span>
          </li>
          {tx.receipt && (
            <li>
              Status:{" "}
              <span
                className={
                  tx.receipt.status
                    ? "text-integra-success"
                    : "text-integra-error"
                }
              >
                {tx.receipt.status ? "Success" : "Failed"}
              </span>
            </li>
          )}
        </ul>
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Tab 2: Input Data
// ---------------------------------------------------------------------------

function InputDataTab({ transaction: tx }: { transaction: Transaction }) {
  const hasInput = tx.input && tx.input !== "0x" && tx.input !== "";

  if (!hasInput) {
    return (
      <GlassCard className="flex items-center justify-center py-12">
        <span className="text-sm text-muted-foreground">No input data</span>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-4 p-5">
      {tx.methodDetails && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Method
          </h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{tx.methodDetails.label}</Badge>
            <span className="font-mono text-xs text-muted-foreground">
              {tx.methodDetails.name}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Raw Input
        </h4>
        <div className="max-h-64 overflow-auto rounded-lg bg-muted/50 p-4">
          <code className="break-all font-mono text-xs leading-relaxed">
            {tx.input}
          </code>
        </div>
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Tab 3: Logs / Events
// ---------------------------------------------------------------------------

function LogsTab({ transaction: tx }: { transaction: Transaction }) {
  const logs = tx.receipt?.logs ?? [];

  if (logs.length === 0) {
    return (
      <GlassCard className="flex items-center justify-center py-12">
        <span className="text-sm text-muted-foreground">No event logs</span>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <GlassCard key={log.logIndex} className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              Log #{log.logIndex}
            </Badge>
            {log.decoded && <Badge variant="outline">{log.decoded.name}</Badge>}
          </div>

          {/* Emitting address */}
          <div className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Address
            </span>
            <p className="break-all font-mono text-xs">{log.address}</p>
          </div>

          {/* Topics */}
          {log.topics.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Topics
              </span>
              <div className="space-y-1">
                {log.topics.map((topic, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Badge
                      variant="secondary"
                      className="mt-0.5 shrink-0 text-[10px]"
                    >
                      {idx}
                    </Badge>
                    <code className="break-all font-mono text-xs text-muted-foreground">
                      {topic}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data */}
          {log.data && log.data !== "0x" && (
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Data
              </span>
              <div className="max-h-32 overflow-auto rounded-lg bg-muted/50 p-3">
                <code className="break-all font-mono text-xs">{log.data}</code>
              </div>
            </div>
          )}

          {/* Decoded args */}
          {log.decoded && Object.keys(log.decoded.args).length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Decoded Arguments
              </span>
              <div className="space-y-1">
                {Object.entries(log.decoded.args).map(([key, val]) => (
                  <div key={key} className="flex gap-2 text-xs">
                    <span className="font-medium text-muted-foreground">
                      {key}:
                    </span>
                    <span className="break-all font-mono">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 4: State Changes
// ---------------------------------------------------------------------------

function StateChangesTab() {
  return (
    <GlassCard className="flex items-center justify-center py-12">
      <span className="text-sm text-muted-foreground">
        State changes are not available for this transaction
      </span>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Main TxTabs
// ---------------------------------------------------------------------------

export function TxTabs({ transaction }: TxTabsProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="input">Input Data</TabsTrigger>
        <TabsTrigger value="logs">
          Logs
          {transaction.receipt?.logs && transaction.receipt.logs.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 text-[10px]">
              {transaction.receipt.logs.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="state">
          <span className="hidden sm:inline">State Changes</span>
          <span className="sm:hidden">State</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab transaction={transaction} />
      </TabsContent>

      <TabsContent value="input">
        <InputDataTab transaction={transaction} />
      </TabsContent>

      <TabsContent value="logs">
        <LogsTab transaction={transaction} />
      </TabsContent>

      <TabsContent value="state">
        <StateChangesTab />
      </TabsContent>
    </Tabs>
  );
}
