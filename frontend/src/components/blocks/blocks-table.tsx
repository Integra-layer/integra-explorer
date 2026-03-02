"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SkeletonShimmer } from "@/components/effects";
import { truncateAddress, timeAgo, formatGas } from "@/lib/format";
import type { Block } from "@/lib/api/types";

interface BlocksTableProps {
  blocks: Block[];
  isLoading: boolean;
}

const SKELETON_ROWS = 25;

function SkeletonRow({ index }: { index: number }) {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <SkeletonShimmer className="h-5 w-20" />
      </td>
      <td className="px-4 py-3">
        <SkeletonShimmer className="h-4 w-16" />
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <SkeletonShimmer className="h-4 w-28" />
      </td>
      <td className="px-4 py-3">
        <SkeletonShimmer className="h-5 w-14" />
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        <SkeletonShimmer className="h-4 w-24" />
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        <SkeletonShimmer className="h-4 w-24" />
      </td>
    </tr>
  );
}

export function BlocksTable({ blocks, isLoading }: BlocksTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 border-b border-border/50 bg-muted/80 backdrop-blur-sm">
          <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Block</th>
            <th className="px-4 py-3">Age</th>
            <th className="hidden px-4 py-3 md:table-cell">Validator</th>
            <th className="px-4 py-3">Txs</th>
            <th className="hidden px-4 py-3 lg:table-cell">Gas Used</th>
            <th className="hidden px-4 py-3 lg:table-cell">Gas Limit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <SkeletonRow key={i} index={i} />
              ))
            : blocks.map((block, i) => (
                <motion.tr
                  key={block.number}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.015 }}
                  className="transition-colors hover:bg-muted/50"
                >
                  {/* Block Number */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/blocks/${block.number}`}
                      className="font-mono text-sm font-medium text-integra-brand hover:underline"
                    >
                      {block.number.toLocaleString()}
                    </Link>
                  </td>

                  {/* Age */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {timeAgo(block.timestamp)}
                  </td>

                  {/* Validator */}
                  <td className="hidden px-4 py-3 md:table-cell">
                    <Link
                      href={`/address/${block.miner}`}
                      className="font-mono text-xs text-muted-foreground hover:text-integra-brand hover:underline"
                    >
                      {truncateAddress(block.miner)}
                    </Link>
                  </td>

                  {/* Transaction Count */}
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {block.transactionCount}
                    </Badge>
                  </td>

                  {/* Gas Used */}
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {formatGas(block.gasUsed)}
                  </td>

                  {/* Gas Limit */}
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {formatGas(block.gasLimit)}
                  </td>
                </motion.tr>
              ))}
        </tbody>
      </table>

      {/* Empty state */}
      {!isLoading && blocks.length === 0 && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          No blocks found
        </div>
      )}
    </div>
  );
}
