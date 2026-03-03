"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/effects";
import type { AbiFunction } from "@/lib/api/contracts";

interface WriteContractProps {
  functions: AbiFunction[];
  /** Pass true once a wallet is connected (wagmi integration hook-up point). */
  walletConnected?: boolean;
}

interface WriteFunctionCardProps {
  fn: AbiFunction;
  walletConnected: boolean;
}

function WriteFunctionCard({ fn, walletConnected }: WriteFunctionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  function handleInputChange(key: string, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function handleWrite() {
    if (!walletConnected) return;
    // TODO: Integrate with wagmi useWriteContract once wallet provider is connected.
    setStatus("[Wallet integration pending] Transaction would be submitted here.");
  }

  const isWritable =
    fn.stateMutability === "nonpayable" || fn.stateMutability === "payable";
  if (!isWritable) return null;

  return (
    <div className="rounded-lg border border-border/40 bg-white/[0.02] transition-colors hover:border-border/60">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-foreground">
            {fn.name}
          </span>
          {fn.stateMutability === "payable" && (
            <span className="text-xs text-integra-warning font-medium">payable</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-border/40 px-4 pb-4 pt-3 space-y-3">
          {!walletConnected ? (
            <div className="flex items-center gap-2 rounded-md border border-integra-warning/30 bg-integra-warning/5 px-3 py-2">
              <Wallet className="size-4 text-integra-warning shrink-0" />
              <p className="text-xs text-integra-warning">
                Connect your wallet to interact with this function.
              </p>
            </div>
          ) : (
            <>
              {fn.inputs.length > 0 ? (
                <div className="space-y-2">
                  {fn.inputs.map((param, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground font-mono">
                        {param.name ? `${param.name} (${param.type})` : param.type}
                      </label>
                      {param.type === "bool" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`${fn.name}-w-${i}`}
                            className="size-4 rounded accent-integra-brand"
                            onChange={(e) =>
                              handleInputChange(
                                param.name || String(i),
                                e.target.checked ? "true" : "false",
                              )
                            }
                          />
                          <label
                            htmlFor={`${fn.name}-w-${i}`}
                            className="text-sm text-muted-foreground"
                          >
                            {inputs[param.name || String(i)] === "true" ? "true" : "false"}
                          </label>
                        </div>
                      ) : (
                        <Input
                          placeholder={param.type}
                          value={inputs[param.name || String(i)] ?? ""}
                          onChange={(e) =>
                            handleInputChange(param.name || String(i), e.target.value)
                          }
                          className="h-8 font-mono text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No inputs required.</p>
              )}

              {fn.stateMutability === "payable" && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground font-mono">
                    value (IRL, optional)
                  </label>
                  <Input
                    placeholder="0"
                    className="h-8 font-mono text-xs"
                    onChange={(e) => handleInputChange("__value", e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <Button
            size="sm"
            disabled={!walletConnected}
            className="gap-1.5 text-xs bg-integra-brand/90 hover:bg-integra-brand text-white"
            onClick={handleWrite}
          >
            <Pencil className="size-3" />
            Write
          </Button>

          {status !== null && (
            <div className="rounded-md border border-border/40 bg-muted/30 px-3 py-2">
              <p className="font-mono text-xs break-all text-foreground">{status}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function WriteContract({
  functions,
  walletConnected = false,
}: WriteContractProps) {
  const writable = functions.filter(
    (fn) =>
      fn.stateMutability === "nonpayable" || fn.stateMutability === "payable",
  );

  if (writable.length === 0) {
    return (
      <GlassCard className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          No write functions found in this contract&apos;s ABI.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-2">
      {!walletConnected && (
        <div className="flex items-center gap-2 rounded-lg border border-integra-warning/30 bg-integra-warning/5 px-4 py-3">
          <Wallet className="size-4 text-integra-warning shrink-0" />
          <p className="text-sm text-integra-warning">
            Connect your wallet to interact with write functions.
          </p>
        </div>
      )}
      {writable.map((fn, i) => (
        <WriteFunctionCard
          key={`${fn.name}-${i}`}
          fn={fn}
          walletConnected={walletConnected}
        />
      ))}
    </div>
  );
}
