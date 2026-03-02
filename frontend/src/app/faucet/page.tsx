"use client";

import { useState, useCallback } from "react";
import {
  Droplets,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  GlassCard,
  GradientButton,
  PageTransition,
} from "@/components/effects";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                 */
/* ------------------------------------------------------------------ */

type FaucetState = "idle" | "loading" | "success" | "error" | "cooldown";

const FAUCET_API = "https://testnet.integralayer.com/api/faucet";
const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;
const COOLDOWN_MINUTES = 60;

/* ================================================================== */
/*  Page                                                              */
/* ================================================================== */

export default function FaucetPage() {
  const [address, setAddress] = useState("");
  const [state, setState] = useState<FaucetState>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);

  const isValidAddress = ADDRESS_REGEX.test(address);

  const handleRequest = useCallback(async () => {
    if (!isValidAddress) return;

    setState("loading");
    setErrorMsg(null);
    setTxHash(null);

    try {
      const res = await fetch(FAUCET_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Check for rate-limiting
        if (res.status === 429 || data?.error?.includes?.("wait")) {
          setState("cooldown");
          setCooldownEnd(Date.now() + COOLDOWN_MINUTES * 60 * 1000);
          return;
        }
        throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
      }

      setTxHash(data?.txHash || data?.tx_hash || data?.hash || null);
      setState("success");
    } catch (err) {
      setState("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Failed to request tokens. The faucet may be temporarily unavailable.",
      );
    }
  }, [address, isValidAddress]);

  const handleReset = () => {
    setState("idle");
    setTxHash(null);
    setErrorMsg(null);
    setAddress("");
  };

  return (
    <PageTransition>
      <section className="container mx-auto flex min-h-[60vh] items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-integra-brand/10">
              <Droplets className="size-8 text-integra-brand" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Testnet Faucet</h1>
            <p className="mt-2 text-muted-foreground">
              Get testnet IRL tokens for development and testing
            </p>
          </div>

          {/* Main card */}
          <AnimatePresence mode="wait">
            {state === "success" ? (
              <SuccessCard key="success" txHash={txHash} onReset={handleReset} />
            ) : state === "cooldown" ? (
              <CooldownCard key="cooldown" cooldownEnd={cooldownEnd} onReset={handleReset} />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard className="space-y-5 p-6">
                  {/* Amount info */}
                  <div className="rounded-lg border border-integra-brand/20 bg-integra-brand/5 p-4">
                    <p className="text-sm font-medium">You will receive:</p>
                    <p className="mt-1 text-lg font-bold">
                      10 IRL{" "}
                      <span className="text-sm font-normal text-muted-foreground">+</span>{" "}
                      1,000 tUSDI
                    </p>
                  </div>

                  <Separator />

                  {/* Address input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Wallet Address</label>
                    <Input
                      placeholder="0x..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`font-mono ${
                        address && !isValidAddress
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    {address && !isValidAddress && (
                      <p className="text-xs text-red-400">
                        Please enter a valid EVM address (0x + 40 hex characters)
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <GradientButton
                    onClick={handleRequest}
                    disabled={!isValidAddress || state === "loading"}
                    className="flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {state === "loading" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Requesting Tokens...
                      </>
                    ) : (
                      <>
                        <Droplets className="size-4" />
                        Request Tokens
                      </>
                    )}
                  </GradientButton>

                  {/* Error inline */}
                  {state === "error" && errorMsg && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <div>
                        <p>{errorMsg}</p>
                        <p className="mt-1 text-xs opacity-70">
                          You can also use the faucet at{" "}
                          <a
                            href="https://testnet.integralayer.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2"
                          >
                            testnet.integralayer.com
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer hint */}
          <p className="text-center text-xs text-muted-foreground">
            Testnet tokens have no real value. One request per address per hour.
          </p>
        </div>
      </section>
    </PageTransition>
  );
}

/* ================================================================== */
/*  Success Card                                                      */
/* ================================================================== */

function SuccessCard({
  txHash,
  onReset,
}: {
  txHash: string | null;
  onReset: () => void;
}) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <GlassCard className="space-y-5 border-integra-success/30 p-6 text-center">
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="mx-auto flex size-20 items-center justify-center rounded-full bg-integra-success/10"
        >
          <CheckCircle2 className="size-10 text-integra-success" />
        </motion.div>

        <div>
          <h3 className="text-xl font-bold text-integra-success">Tokens Sent!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            10 IRL + 1,000 tUSDI have been sent to your wallet.
          </p>
        </div>

        {txHash && (
          <a
            href={`https://testnet.blockscout.integralayer.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-integra-brand underline underline-offset-4 hover:opacity-80"
          >
            View Transaction
            <ExternalLink className="size-3" />
          </a>
        )}

        <button
          onClick={onReset}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Request more tokens
        </button>
      </GlassCard>
    </motion.div>
  );
}

/* ================================================================== */
/*  Cooldown Card                                                     */
/* ================================================================== */

function CooldownCard({
  cooldownEnd,
  onReset,
}: {
  cooldownEnd: number | null;
  onReset: () => void;
}) {
  const remaining = cooldownEnd ? Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 60000)) : COOLDOWN_MINUTES;

  return (
    <motion.div
      key="cooldown"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <GlassCard className="space-y-4 border-amber-500/30 p-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-500/10">
          <Clock className="size-8 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-amber-400">Cooldown Active</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Please wait approximately {remaining} minutes before requesting again.
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Try a different address
        </button>
      </GlassCard>
    </motion.div>
  );
}
