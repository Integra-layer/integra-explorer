"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown, FileCode } from "lucide-react";
import { GlassCard, CopyButton } from "@/components/effects";
import { truncateAddress, formatIRL } from "@/lib/format";

interface TxFlowProps {
  from: string;
  to: string | null;
  value: string;
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

export function TxFlow({ from, to, value }: TxFlowProps) {
  const formattedValue = formatIRL(value);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
      {/* From Card */}
      <AddressCard label="From" address={from} />

      {/* Animated Arrow + Value */}
      <div className="flex flex-col items-center gap-1">
        {/* Horizontal arrow (desktop) */}
        <motion.div
          className="hidden items-center gap-2 sm:flex"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="h-px w-8 bg-integra-brand/50" />
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
        <motion.span
          className="rounded-full bg-integra-brand/10 px-3 py-1 text-xs font-medium text-integra-brand"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          {formattedValue}
        </motion.span>
      </div>

      {/* To Card */}
      <AddressCard label="To" address={to} isContract={to === null} />
    </div>
  );
}
