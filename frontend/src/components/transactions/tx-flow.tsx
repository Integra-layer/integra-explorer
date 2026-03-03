"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown, FileCode } from "lucide-react";
import { GlassCard, CopyButton } from "@/components/effects";
import { truncateAddress } from "@/lib/format";
import { classifyTransaction } from "@/lib/tx-classifier";
import type { Transaction } from "@/lib/api/types";

interface TxFlowProps {
  transaction: Transaction;
}

function AddressCard({
  label,
  address,
  isContract,
}: {
  label: string;
  address: string | null;
  isContract?: boolean;
}) {
  if (isContract) {
    return (
      <GlassCard className="flex min-w-[180px] flex-1 flex-col items-center gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <FileCode className="size-6 text-integra-brand" />
        <span className="text-sm font-medium text-integra-brand">
          Contract Created
        </span>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex min-w-[180px] flex-1 flex-col items-center gap-2 p-4">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <Link
        href={`/address/${address}`}
        className="font-mono text-sm font-medium text-integra-brand hover:underline"
      >
        {truncateAddress(address ?? "", 6)}
      </Link>
      {address && <CopyButton text={address} className="size-7" />}
    </GlassCard>
  );
}

export function TxFlow({ transaction }: TxFlowProps) {
  const classified = classifyTransaction(transaction);

  const isApproval =
    classified.category === "erc20-approve" ||
    classified.category === "approval-for-all";

  const showViaContract =
    classified.contractAddress &&
    classified.to !== classified.contractAddress &&
    !isApproval;

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
      {/* From Card */}
      <AddressCard label="From" address={classified.from} />

      {/* Animated Arrow + Value */}
      <div className="flex flex-col items-center gap-1">
        {/* Horizontal arrow (desktop) */}
        <motion.div
          className="hidden items-center gap-2 sm:flex"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="h-0.5 flex-1 bg-gradient-to-r from-integra-brand/40 via-integra-pink/60 to-integra-brand/40" />
          <ArrowRight className="size-5 text-integra-brand" />
        </motion.div>

        {/* Vertical arrow (mobile) */}
        <motion.div
          className="flex items-center gap-2 sm:hidden"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ArrowDown className="size-5 text-integra-brand" />
        </motion.div>

        {/* Value label */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2,
          }}
          className="flex flex-col items-center gap-0.5"
        >
          <span className="rounded-full bg-integra-brand/10 px-3 py-1 text-xs font-medium text-integra-brand">
            {isApproval ? "Approved" : classified.value}
          </span>
          {showViaContract && (
            <span className="text-[10px] text-muted-foreground">
              via{" "}
              <Link
                href={`/address/${classified.contractAddress}`}
                className="text-integra-brand hover:underline"
              >
                {truncateAddress(classified.contractAddress!, 4)}
              </Link>
            </span>
          )}
        </motion.div>
      </div>

      {/* To Card */}
      <AddressCard
        label="To"
        address={classified.to}
        isContract={classified.category === "contract-creation"}
      />
    </div>
  );
}
