"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/effects";
import type { AbiFunction } from "@/lib/api/contracts";

interface ReadContractProps {
  functions: AbiFunction[];
}

interface FunctionCardProps {
  fn: AbiFunction;
}

function FunctionCard({ fn }: FunctionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);

  function handleInputChange(paramName: string, value: string) {
    setInputs((prev) => ({ ...prev, [paramName]: value }));
  }

  function handleQuery() {
    // TODO: Integrate with wagmi useReadContract or ethers.js once wallet is connected.
    // For now show a placeholder result indicating the call would be made.
    const paramSummary = fn.inputs.length > 0
      ? fn.inputs.map((p) => `${p.name || p.type}: ${inputs[p.name] ?? ""}`.trim()).join(", ")
      : "none";
    setResult(`[Connect wallet or RPC to query] (params: ${paramSummary})`);
  }

  const isReadable = fn.stateMutability === "view" || fn.stateMutability === "pure";
  if (!isReadable) return null;

  return (
    <div className="rounded-lg border border-border/40 bg-white/[0.02] transition-colors hover:border-border/60">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-foreground">
            {fn.name}
          </span>
          {fn.outputs.length > 0 && (
            <span className="text-xs text-muted-foreground">
              → {fn.outputs.map((o) => o.type).join(", ")}
            </span>
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
                        id={`${fn.name}-${i}`}
                        className="size-4 rounded accent-integra-brand"
                        onChange={(e) =>
                          handleInputChange(param.name || String(i), e.target.checked ? "true" : "false")
                        }
                      />
                      <label htmlFor={`${fn.name}-${i}`} className="text-sm text-muted-foreground">
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

          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={handleQuery}
          >
            <Play className="size-3" />
            Query
          </Button>

          {result !== null && (
            <div className="rounded-md border border-border/40 bg-muted/30 px-3 py-2">
              <p className="font-mono text-xs break-all text-foreground">{result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ReadContract({ functions }: ReadContractProps) {
  const readable = functions.filter(
    (fn) => fn.stateMutability === "view" || fn.stateMutability === "pure",
  );

  if (readable.length === 0) {
    return (
      <GlassCard className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          No read functions found in this contract&apos;s ABI.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-2">
      {readable.map((fn, i) => (
        <FunctionCard key={`${fn.name}-${i}`} fn={fn} />
      ))}
    </div>
  );
}
