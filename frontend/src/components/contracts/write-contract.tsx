"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Wallet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Coins,
} from "lucide-react";
import { parseEther } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassCard, CopyButton } from "@/components/effects";
import type { AbiFunction } from "@/lib/api/contracts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a user-supplied string into the correct ABI arg type. */
function parseInputValue(value: string, type: string): unknown {
  if (type === "bool") {
    return value === "true" || value === "1";
  }
  if (/^u?int\d*$/.test(type)) {
    try {
      return BigInt(value);
    } catch {
      return value;
    }
  }
  if (type.startsWith("bytes")) {
    return value as `0x${string}`;
  }
  if (type === "address") {
    return value as `0x${string}`;
  }
  if (type.endsWith("[]")) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  if (type === "tuple") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

/** Extract a readable error message from wagmi/viem errors. */
function extractErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    // Wagmi/viem shortMessage
    if (typeof e.shortMessage === "string") return e.shortMessage;
    if (typeof e.message === "string") {
      const msg = e.message as string;
      if (msg.includes("User rejected")) return "Transaction rejected by user";
      if (msg.includes("Details:"))
        return msg.split("Details:")[0].trim();
      return msg.length > 250 ? msg.slice(0, 250) + "..." : msg;
    }
  }
  return String(err);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface WriteContractProps {
  functions: AbiFunction[];
  contractAddress: string;
}

interface WriteFunctionCardProps {
  fn: AbiFunction;
  index: number;
  contractAddress: string;
  isConnected: boolean;
}

// ---------------------------------------------------------------------------
// WriteFunctionCard
// ---------------------------------------------------------------------------
function WriteFunctionCard({
  fn,
  index,
  contractAddress,
  isConnected,
}: WriteFunctionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [valueInput, setValueInput] = useState("");

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Determine current state
  type TxState = "idle" | "pending" | "confirming" | "confirmed" | "error";
  let txState: TxState = "idle";
  if (writeError || receiptError) txState = "error";
  else if (isConfirmed) txState = "confirmed";
  else if (isConfirming) txState = "confirming";
  else if (isPending) txState = "pending";

  const errorMessage = writeError
    ? extractErrorMessage(writeError)
    : receiptError
      ? extractErrorMessage(receiptError)
      : null;

  // Reset tx state when collapsing
  useEffect(() => {
    if (!expanded) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  function handleWrite() {
    if (!isConnected) return;

    const args = fn.inputs.map((param, i) => {
      const key = param.name || String(i);
      const raw = inputs[key] ?? "";
      return parseInputValue(raw, param.type);
    });

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: [
        {
          type: "function" as const,
          name: fn.name,
          inputs: fn.inputs.map((inp) => ({
            name: inp.name,
            type: inp.type,
          })),
          outputs: fn.outputs.map((out) => ({
            name: out.name,
            type: out.type,
          })),
          stateMutability: fn.stateMutability as
            | "view"
            | "pure"
            | "nonpayable"
            | "payable",
        },
      ],
      functionName: fn.name,
      args: args.length > 0 ? args : undefined,
      value:
        fn.stateMutability === "payable" && valueInput
          ? parseEther(valueInput)
          : undefined,
    });
  }

  const isPayable = fn.stateMutability === "payable";

  return (
    <GlassCard className="overflow-hidden">
      {/* ---- Header ---- */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
      >
        {/* Number badge */}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-integra-brand to-integra-brand/70 text-xs font-bold text-white shadow-sm">
          {index}
        </span>

        {/* Function name */}
        <span className="min-w-0 flex-1 truncate font-mono text-sm font-semibold text-foreground">
          {fn.name}
        </span>

        {/* Payable badge */}
        {isPayable && (
          <Badge className="gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] px-1.5">
            <Coins className="size-2.5" />
            payable
          </Badge>
        )}

        {/* Chevron */}
        <span className="shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </span>
      </button>

      {/* ---- Expanded body ---- */}
      {expanded && (
        <div className="border-t border-border/30 bg-white/[0.01] px-5 pb-5 pt-4 space-y-4">
          {/* Not connected warning — inline */}
          {!isConnected && (
            <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3">
              <Wallet className="size-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-500/90">
                Connect your wallet to interact with this function.
              </p>
            </div>
          )}

          {/* Inputs — always visible so users can inspect */}
          {fn.inputs.length > 0 ? (
            <div className="space-y-3">
              {fn.inputs.map((param, i) => {
                const key = param.name || String(i);
                return (
                  <div key={i} className="space-y-1.5">
                    <label className="flex items-baseline gap-2 text-xs">
                      <span className="font-medium text-foreground/80">
                        {param.name || `arg${i}`}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        ({param.type})
                      </span>
                    </label>
                    {param.type === "bool" ? (
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            const current = inputs[key] === "true";
                            setInputs((prev) => ({
                              ...prev,
                              [key]: current ? "false" : "true",
                            }));
                          }}
                          disabled={!isConnected}
                          className={`
                            relative h-6 w-11 rounded-full transition-colors duration-200
                            ${inputs[key] === "true" ? "bg-integra-brand" : "bg-border/60"}
                            ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}
                          `}
                        >
                          <span
                            className={`
                              absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200
                              ${inputs[key] === "true" ? "translate-x-5" : "translate-x-0"}
                            `}
                          />
                        </button>
                        <span className="font-mono text-xs text-muted-foreground">
                          {inputs[key] === "true" ? "true" : "false"}
                        </span>
                      </div>
                    ) : (
                      <Input
                        placeholder={`Enter ${param.type}...`}
                        value={inputs[key] ?? ""}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        disabled={!isConnected}
                        className="h-9 font-mono text-xs bg-black/[0.03] dark:bg-white/[0.03] border-border/50 focus-visible:border-integra-brand/50 focus-visible:ring-integra-brand/20 disabled:opacity-40"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No inputs required
            </p>
          )}

          {/* Payable value input */}
          {isPayable && (
            <div className="space-y-1.5">
              <label className="flex items-baseline gap-2 text-xs">
                <Coins className="size-3 text-amber-500" />
                <span className="font-medium text-amber-500">
                  IRL value
                </span>
                <span className="text-[10px] text-muted-foreground">
                  (amount to send)
                </span>
              </label>
              <Input
                placeholder="0.0"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                disabled={!isConnected}
                className="h-9 font-mono text-xs border-amber-500/30 bg-amber-500/[0.03] focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20 disabled:opacity-40"
              />
            </div>
          )}

          {/* Write button */}
          <Button
            size="sm"
            disabled={!isConnected || isPending || isConfirming}
            onClick={handleWrite}
            className="gap-2 bg-gradient-to-r from-integra-brand to-[#FF8F6B] text-white shadow-md shadow-integra-brand/20 hover:shadow-lg hover:shadow-integra-brand/30 hover:brightness-110 transition-all duration-200 disabled:opacity-50"
          >
            {isPending || isConfirming ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Pencil className="size-3.5" />
            )}
            {isPending
              ? "Confirm in wallet..."
              : isConfirming
                ? "Confirming..."
                : "Write"}
          </Button>

          {/* ---- Transaction status ---- */}

          {/* Pending — waiting for wallet */}
          {txState === "pending" && (
            <div className="rounded-lg border border-integra-brand/20 bg-integra-brand/[0.03] px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin text-integra-brand" />
                <span className="text-xs text-integra-brand">
                  Waiting for wallet confirmation...
                </span>
              </div>
            </div>
          )}

          {/* Confirming — tx submitted, waiting for receipt */}
          {txState === "confirming" && hash && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin text-integra-brand" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-integra-brand">
                  Waiting for confirmation
                </span>
              </div>
              <div className="rounded-lg border border-integra-brand/20 bg-integra-brand/[0.03] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Tx Hash:
                  </span>
                  <Link
                    href={`/transactions/${hash}`}
                    className="font-mono text-xs text-integra-brand hover:underline truncate"
                  >
                    {hash}
                  </Link>
                  <CopyButton text={hash} className="size-6 shrink-0" />
                  <Link
                    href={`/transactions/${hash}`}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Confirmed */}
          {txState === "confirmed" && hash && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-integra-success" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-integra-success">
                  Transaction confirmed
                </span>
              </div>
              <div className="rounded-lg border border-integra-success/20 bg-integra-success/[0.03] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Tx Hash:
                  </span>
                  <Link
                    href={`/transactions/${hash}`}
                    className="font-mono text-xs text-integra-brand hover:underline truncate"
                  >
                    {hash}
                  </Link>
                  <CopyButton text={hash} className="size-6 shrink-0" />
                  <Link
                    href={`/transactions/${hash}`}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {txState === "error" && errorMessage && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="size-3 text-integra-error" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-integra-error">
                  Error
                </span>
              </div>
              <div className="rounded-lg border border-integra-error/20 bg-integra-error/[0.03] px-4 py-3">
                <p className="font-mono text-xs leading-relaxed break-all text-integra-error/90">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// WriteContract
// ---------------------------------------------------------------------------
export function WriteContract({
  functions,
  contractAddress,
}: WriteContractProps) {
  const { isConnected } = useAppKitAccount();
  const { open } = useAppKit();

  const writable = functions.filter(
    (fn) =>
      fn.stateMutability === "nonpayable" || fn.stateMutability === "payable",
  );

  if (writable.length === 0) {
    return (
      <GlassCard className="flex flex-col items-center justify-center gap-2 py-16">
        <AlertCircle className="size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No write functions found in this contract&apos;s ABI.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {writable.length} write function{writable.length !== 1 ? "s" : ""}
        </p>
        {isConnected ? (
          <Badge
            variant="secondary"
            className="gap-1 text-[10px] text-integra-success"
          >
            <span className="size-1.5 rounded-full bg-integra-success" />
            Wallet connected
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="gap-1 text-[10px] text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            Wallet required
          </Badge>
        )}
      </div>

      {/* Connect wallet banner */}
      {!isConnected && (
        <GlassCard className="p-5">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
                <Wallet className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Wallet not connected
                </p>
                <p className="text-xs text-muted-foreground">
                  Connect your wallet to submit write transactions
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => open()}
              className="gap-2 bg-gradient-to-r from-integra-brand to-[#FF8F6B] text-white shadow-md shadow-integra-brand/20 hover:shadow-lg hover:shadow-integra-brand/30 hover:brightness-110 transition-all duration-200"
            >
              <Wallet className="size-3.5" />
              Connect Wallet
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Function cards */}
      {writable.map((fn, i) => (
        <WriteFunctionCard
          key={`${fn.name}-${i}`}
          fn={fn}
          index={i + 1}
          contractAddress={contractAddress}
          isConnected={isConnected}
        />
      ))}
    </div>
  );
}
