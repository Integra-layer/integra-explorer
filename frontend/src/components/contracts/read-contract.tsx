"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Play,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createPublicClient, http } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassCard, CopyButton } from "@/components/effects";
import { integraTestnet } from "@/lib/appkit/chains";
import type { AbiFunction } from "@/lib/api/contracts";

// ---------------------------------------------------------------------------
// Public viem client — no wallet needed for read operations
// ---------------------------------------------------------------------------
const publicClient = createPublicClient({
  chain: integraTestnet,
  transport: http(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a user-supplied string into the correct ABI arg type. */
function parseInputValue(value: string, type: string): unknown {
  // Boolean
  if (type === "bool") {
    return value === "true" || value === "1";
  }
  // Integer types (uint*, int*)
  if (/^u?int\d*$/.test(type)) {
    try {
      return BigInt(value);
    } catch {
      return value;
    }
  }
  // Bytes (leave as hex string)
  if (type.startsWith("bytes")) {
    return value as `0x${string}`;
  }
  // Address
  if (type === "address") {
    return value as `0x${string}`;
  }
  // Arrays — try JSON parse
  if (type.endsWith("[]")) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  // Tuple — try JSON parse
  if (type === "tuple") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  // String and everything else
  return value;
}

/** Format a contract read result for display. */
function formatResult(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    return (
      "[\n" +
      value.map((v, i) => `  [${i}]: ${formatResult(v)}`).join("\n") +
      "\n]"
    );
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(
        value,
        (_k, v) => (typeof v === "bigint" ? v.toString() : v),
        2,
      );
    } catch {
      return String(value);
    }
  }
  return String(value);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ReadContractProps {
  functions: AbiFunction[];
  contractAddress: string;
}

interface FunctionCardProps {
  fn: AbiFunction;
  index: number;
  contractAddress: string;
}

// ---------------------------------------------------------------------------
// FunctionCard
// ---------------------------------------------------------------------------
function FunctionCard({ fn, index, contractAddress }: FunctionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasAutoQueried = useRef(false);

  const hasInputs = fn.inputs.length > 0;

  // ---- Query handler ----
  const handleQuery = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const args = fn.inputs.map((param, i) => {
        const key = param.name || String(i);
        const raw = inputs[key] ?? "";
        return parseInputValue(raw, param.type);
      });

      const data = await publicClient.readContract({
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
      });

      setResult(formatResult(data));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      // Trim overly verbose viem messages
      const shortMessage = message.includes("Details:")
        ? message.split("Details:")[0].trim()
        : message.length > 300
          ? message.slice(0, 300) + "..."
          : message;
      setError(shortMessage);
    } finally {
      setLoading(false);
    }
  }, [fn, inputs, contractAddress]);

  // Auto-query functions with no inputs when expanded
  useEffect(() => {
    if (expanded && !hasInputs && !hasAutoQueried.current) {
      hasAutoQueried.current = true;
      handleQuery();
    }
  }, [expanded, hasInputs, handleQuery]);

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

        {/* Return type badges */}
        {fn.outputs.length > 0 && (
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="text-xs text-muted-foreground">&rarr;</span>
            {fn.outputs.map((o, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="font-mono text-[10px] px-1.5 py-0"
              >
                {o.type}
              </Badge>
            ))}
          </div>
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
          {/* Inputs */}
          {hasInputs ? (
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
                          className={`
                            relative h-6 w-11 rounded-full transition-colors duration-200
                            ${inputs[key] === "true" ? "bg-integra-brand" : "bg-border/60"}
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
                        className="h-9 font-mono text-xs bg-black/[0.03] dark:bg-white/[0.03] border-border/50 focus-visible:border-integra-brand/50 focus-visible:ring-integra-brand/20"
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

          {/* Query button */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={loading}
              onClick={handleQuery}
              className="gap-2 bg-gradient-to-r from-integra-brand to-[#FF8F6B] text-white shadow-md shadow-integra-brand/20 hover:shadow-lg hover:shadow-integra-brand/30 hover:brightness-110 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5" />
              )}
              {loading ? "Querying..." : "Query"}
            </Button>

            {/* Refresh for no-input functions */}
            {!hasInputs && result !== null && (
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={handleQuery}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw
                  className={`size-3.5 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            )}
          </div>

          {/* Loading state */}
          {loading && result === null && error === null && (
            <div className="rounded-lg border border-border/30 bg-muted/20 px-4 py-3 animate-pulse">
              <div className="flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin text-integra-brand" />
                <span className="text-xs text-muted-foreground">
                  Querying contract...
                </span>
              </div>
            </div>
          )}

          {/* Result */}
          {result !== null && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-integra-success" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-integra-success">
                  Result
                </span>
              </div>
              <div className="group relative rounded-lg border border-integra-success/20 bg-integra-success/[0.03] px-4 py-3">
                <pre className="font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-foreground">
                  {result}
                </pre>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyButton text={result} className="size-7" />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error !== null && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="size-3 text-integra-error" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-integra-error">
                  Error
                </span>
              </div>
              <div className="rounded-lg border border-integra-error/20 bg-integra-error/[0.03] px-4 py-3">
                <p className="font-mono text-xs leading-relaxed break-all text-integra-error/90">
                  {error}
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
// ReadContract
// ---------------------------------------------------------------------------
export function ReadContract({ functions, contractAddress }: ReadContractProps) {
  const readable = functions.filter(
    (fn) => fn.stateMutability === "view" || fn.stateMutability === "pure",
  );

  if (readable.length === 0) {
    return (
      <GlassCard className="flex flex-col items-center justify-center gap-2 py-16">
        <AlertCircle className="size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No read functions found in this contract&apos;s ABI.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {readable.length} read function{readable.length !== 1 ? "s" : ""}
        </p>
        <Badge
          variant="secondary"
          className="gap-1 text-[10px] text-muted-foreground"
        >
          <span className="size-1.5 rounded-full bg-integra-success animate-pulse" />
          No wallet required
        </Badge>
      </div>

      {/* Function cards */}
      {readable.map((fn, i) => (
        <FunctionCard
          key={`${fn.name}-${i}`}
          fn={fn}
          index={i + 1}
          contractAddress={contractAddress}
        />
      ))}
    </div>
  );
}
