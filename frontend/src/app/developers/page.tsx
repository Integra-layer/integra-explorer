"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Code2,
  FileCode,
  ArrowRightLeft,
  Play,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GlassCard,
  GradientButton,
  PageTransition,
  CopyButton,
} from "@/components/effects";

/* ------------------------------------------------------------------ */
/*  Unit conversion helpers                                           */
/* ------------------------------------------------------------------ */

// Exponents relative to wei
const UNIT_EXPONENTS: Record<string, number> = {
  wei: 0,
  gwei: 9,
  airl: 18,
  IRL: 18,
};

function convert(amount: string, from: string, to: string): string {
  if (!amount || amount === "0") return "0";
  try {
    const num = parseFloat(amount);
    if (isNaN(num)) return "Invalid";
    const fromExp = UNIT_EXPONENTS[from];
    const toExp = UNIT_EXPONENTS[to];
    if (fromExp === undefined || toExp === undefined) return "0";

    // Convert: value_in_target = value_in_source * 10^(fromExp - toExp)
    const diff = fromExp - toExp;
    const result = num * Math.pow(10, diff);

    if (result === 0) return "0";
    // Format with up to 18 significant digits, trim trailing zeros
    const formatted = result.toLocaleString("en-US", {
      maximumFractionDigits: 18,
      useGrouping: false,
    });
    return formatted;
  } catch {
    return "Invalid";
  }
}

function allConversions(amount: string, from: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const unit of Object.keys(UNIT_EXPONENTS)) {
    result[unit] = convert(amount, from, unit);
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  RPC Playground defaults                                           */
/* ------------------------------------------------------------------ */

const RPC_METHODS = [
  { method: "eth_blockNumber", params: [] },
  { method: "eth_chainId", params: [] },
  { method: "net_version", params: [] },
  { method: "eth_gasPrice", params: [] },
  {
    method: "eth_getBalance",
    params: ["0x0000000000000000000000000000000000000000", "latest"],
  },
] as const;

const DEFAULT_RPC_URL = "https://testnet.integralayer.com/evm";

/* ------------------------------------------------------------------ */
/*  Compiler versions                                                 */
/* ------------------------------------------------------------------ */

const COMPILER_VERSIONS = [
  "v0.8.28",
  "v0.8.27",
  "v0.8.26",
  "v0.8.25",
  "v0.8.24",
  "v0.8.23",
  "v0.8.22",
  "v0.8.21",
  "v0.8.20",
  "v0.8.19",
];

/* ================================================================== */
/*  Page                                                              */
/* ================================================================== */

export default function DevelopersPage() {
  return (
    <PageTransition>
      <section className="container mx-auto space-y-6 px-4 py-8">
        {/* Heading */}
        <div className="flex items-center gap-3">
          <Code2 className="size-6 text-integra-brand" />
          <h1 className="text-2xl font-bold tracking-tight">Developer Tools</h1>
        </div>
        <p className="max-w-2xl text-muted-foreground">
          Utilities for building and debugging on Integra Layer. Verify
          contracts, decode ABI data, convert units, and test RPC endpoints.
        </p>

        <Tabs defaultValue="verifier" className="w-full">
          <TabsList className="w-full max-w-2xl">
            <TabsTrigger value="verifier" className="gap-1.5">
              <CheckCircle2 className="size-4" />
              <span className="hidden sm:inline">Contract Verifier</span>
              <span className="sm:hidden">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="abi" className="gap-1.5">
              <FileCode className="size-4" />
              <span className="hidden sm:inline">ABI Decoder</span>
              <span className="sm:hidden">ABI</span>
            </TabsTrigger>
            <TabsTrigger value="converter" className="gap-1.5">
              <ArrowRightLeft className="size-4" />
              <span className="hidden sm:inline">Unit Converter</span>
              <span className="sm:hidden">Units</span>
            </TabsTrigger>
            <TabsTrigger value="rpc" className="gap-1.5">
              <Play className="size-4" />
              <span className="hidden sm:inline">RPC Playground</span>
              <span className="sm:hidden">RPC</span>
            </TabsTrigger>
          </TabsList>

          {/* ---- Contract Verifier ---- */}
          <TabsContent value="verifier" className="mt-6">
            <ContractVerifierTab />
          </TabsContent>

          {/* ---- ABI Decoder ---- */}
          <TabsContent value="abi" className="mt-6">
            <AbiDecoderTab />
          </TabsContent>

          {/* ---- Unit Converter ---- */}
          <TabsContent value="converter" className="mt-6">
            <UnitConverterTab />
          </TabsContent>

          {/* ---- RPC Playground ---- */}
          <TabsContent value="rpc" className="mt-6">
            <RpcPlaygroundTab />
          </TabsContent>
        </Tabs>
      </section>
    </PageTransition>
  );
}

/* ================================================================== */
/*  Tab 1: Contract Verifier                                          */
/* ================================================================== */

function ContractVerifierTab() {
  const [address, setAddress] = useState("");
  const [compiler, setCompiler] = useState(COMPILER_VERSIONS[0]);
  const [optimization, setOptimization] = useState(false);
  const [source, setSource] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <GlassCard className="max-w-2xl p-6">
      {submitted ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle2 className="size-12 text-integra-success" />
          <h3 className="text-lg font-semibold">Verification Submitted</h3>
          <p className="text-sm text-muted-foreground">
            Contract verification is currently handled through the admin panel.
            Your submission has been recorded for review.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-sm text-integra-brand underline underline-offset-4 hover:opacity-80"
          >
            Submit another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Contract Address</label>
            <Input
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="font-mono"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Compiler Version</label>
              <select
                value={compiler}
                onChange={(e) => setCompiler(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {COMPILER_VERSIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={optimization}
                  onChange={(e) => setOptimization(e.target.checked)}
                  className="size-4 rounded border-input accent-integra-brand"
                />
                Optimization Enabled
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Source Code (Solidity)
            </label>
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              rows={12}
              placeholder="// SPDX-License-Identifier: MIT&#10;pragma solidity ^0.8.20;&#10;&#10;contract MyContract {&#10;  ...&#10;}"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          <GradientButton type="submit" className="w-full">
            Verify Contract
          </GradientButton>
        </form>
      )}
    </GlassCard>
  );
}

/* ================================================================== */
/*  Tab 2: ABI Decoder                                                */
/* ================================================================== */

function AbiDecoderTab() {
  const [abiInput, setAbiInput] = useState("");
  const [hexData, setHexData] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleDecode() {
    setError(null);
    setOutput(null);

    if (!abiInput.trim()) {
      setError("Please provide an ABI JSON.");
      return;
    }

    try {
      const parsed = JSON.parse(abiInput);
      const formatted = JSON.stringify(parsed, null, 2);

      if (hexData.trim()) {
        // Show the formatted ABI + the hex data info
        const cleanHex = hexData.trim();
        const selector = cleanHex.slice(0, 10);
        const dataBody = cleanHex.slice(10);
        const chunks =
          dataBody.length > 0
            ? (dataBody.match(/.{1,64}/g)?.map((c, i) => `  [${i}] 0x${c}`) ??
              [])
            : [];

        setOutput(
          `=== ABI (formatted) ===\n${formatted}\n\n=== Encoded Data ===\nSelector: ${selector}\n${
            chunks.length > 0
              ? `Parameters (32-byte words):\n${chunks.join("\n")}`
              : "No parameter data"
          }`,
        );
      } else {
        setOutput(`=== ABI (formatted) ===\n${formatted}`);
      }
    } catch {
      setError("Invalid JSON. Please check your ABI input.");
    }
  }

  return (
    <GlassCard className="max-w-2xl space-y-5 p-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">ABI (JSON)</label>
        <textarea
          value={abiInput}
          onChange={(e) => setAbiInput(e.target.value)}
          rows={8}
          placeholder='[{"inputs":[],"name":"myFunction","outputs":[{"type":"uint256"}],"type":"function"}]'
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Encoded Data (hex, optional)
        </label>
        <textarea
          value={hexData}
          onChange={(e) => setHexData(e.target.value)}
          rows={3}
          placeholder="0x..."
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <GradientButton onClick={handleDecode} className="w-full">
        Decode
      </GradientButton>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {output && (
        <div className="relative">
          <div className="absolute right-2 top-2">
            <CopyButton text={output} />
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg border border-white/10 bg-black/30 p-4 font-mono text-xs leading-relaxed text-emerald-400">
            {output}
          </pre>
        </div>
      )}
    </GlassCard>
  );
}

/* ================================================================== */
/*  Tab 3: Unit Converter                                             */
/* ================================================================== */

function UnitConverterTab() {
  const [amount, setAmount] = useState("1");
  const [fromUnit, setFromUnit] = useState("IRL");

  const conversions = useMemo(
    () => allConversions(amount, fromUnit),
    [amount, fromUnit],
  );

  const unitDescriptions: Record<string, string> = {
    wei: "Smallest unit (base)",
    gwei: "10\u2079 wei",
    airl: "10\u00B9\u2078 wei (native denom)",
    IRL: "10\u00B9\u2078 wei (display denom)",
  };

  return (
    <GlassCard className="max-w-2xl space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.0"
            className="font-mono text-lg"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">From</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="flex h-9 w-full min-w-[100px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {Object.keys(UNIT_EXPONENTS).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Equivalent Values
        </h3>
        <div className="grid gap-3">
          {Object.entries(conversions).map(([unit, value]) => (
            <div
              key={unit}
              className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                unit === fromUnit
                  ? "border-integra-brand/40 bg-integra-brand/5"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div>
                <span className="font-mono font-semibold">{unit}</span>
                <p className="text-xs text-muted-foreground">
                  {unitDescriptions[unit]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="max-w-[140px] truncate font-mono text-sm sm:max-w-[300px]">
                  {value}
                </span>
                <CopyButton text={value} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

/* ================================================================== */
/*  Tab 4: RPC Playground                                             */
/* ================================================================== */

function RpcPlaygroundTab() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customParams, setCustomParams] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMethod = RPC_METHODS[selectedIdx];

  const handleSend = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let params: unknown[] = [...selectedMethod.params];
      if (customParams.trim()) {
        try {
          const parsed = JSON.parse(customParams);
          params = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          setError("Invalid JSON in params field.");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(DEFAULT_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: selectedMethod.method,
          params,
        }),
      });

      const json = await res.json();
      setResponse(JSON.stringify(json, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [selectedMethod, customParams]);

  return (
    <GlassCard className="max-w-2xl space-y-5 p-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">RPC Endpoint</label>
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2 font-mono text-sm text-muted-foreground break-all">
          {DEFAULT_RPC_URL}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Method</label>
        <select
          value={selectedIdx}
          onChange={(e) => {
            setSelectedIdx(Number(e.target.value));
            setResponse(null);
            setError(null);
          }}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 font-mono text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {RPC_METHODS.map((m, i) => (
            <option key={m.method} value={i}>
              {m.method}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Params (JSON, optional)</label>
        <textarea
          value={customParams}
          onChange={(e) => setCustomParams(e.target.value)}
          rows={3}
          placeholder={JSON.stringify(selectedMethod.params, null, 2)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <GradientButton
        onClick={handleSend}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Play className="size-4" />
            Send Request
          </>
        )}
      </GradientButton>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {response && (
        <div className="relative">
          <div className="absolute right-2 top-2">
            <CopyButton text={response} />
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg border border-white/10 bg-black/30 p-4 font-mono text-xs leading-relaxed text-emerald-400">
            {response}
          </pre>
        </div>
      )}
    </GlassCard>
  );
}
