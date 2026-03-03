"use client";

import { motion } from "framer-motion";
import type { TallyResult } from "@/lib/api/proposals";

interface VotingBarProps {
  tally: TallyResult;
  showLabels?: boolean;
}

interface VoteSection {
  label: string;
  count: number;
  percentage: number;
  color: string;
  textColor: string;
}

function parseTally(tally: TallyResult): VoteSection[] {
  const yes = Number(tally.yes_count) || 0;
  const no = Number(tally.no_count) || 0;
  const abstain = Number(tally.abstain_count) || 0;
  const veto = Number(tally.no_with_veto_count) || 0;
  const total = yes + no + abstain + veto;

  if (total === 0) {
    return [
      {
        label: "Yes",
        count: 0,
        percentage: 0,
        color: "bg-integra-success",
        textColor: "text-integra-success",
      },
      {
        label: "No",
        count: 0,
        percentage: 0,
        color: "bg-integra-danger",
        textColor: "text-integra-danger",
      },
      {
        label: "Abstain",
        count: 0,
        percentage: 0,
        color: "bg-muted-foreground/50",
        textColor: "text-muted-foreground",
      },
      {
        label: "Veto",
        count: 0,
        percentage: 0,
        color: "bg-integra-warning",
        textColor: "text-integra-warning",
      },
    ];
  }

  return [
    {
      label: "Yes",
      count: yes,
      percentage: (yes / total) * 100,
      color: "bg-integra-success",
      textColor: "text-integra-success",
    },
    {
      label: "No",
      count: no,
      percentage: (no / total) * 100,
      color: "bg-integra-danger",
      textColor: "text-integra-danger",
    },
    {
      label: "Abstain",
      count: abstain,
      percentage: (abstain / total) * 100,
      color: "bg-muted-foreground/50",
      textColor: "text-muted-foreground",
    },
    {
      label: "Veto",
      count: veto,
      percentage: (veto / total) * 100,
      color: "bg-integra-warning",
      textColor: "text-integra-warning",
    },
  ];
}

function formatVoteCount(count: number): string {
  if (count === 0) return "0";
  // If raw counts are in airl (18 decimals), convert to IRL
  if (count >= 1e15) {
    const irl = count / 1e18;
    return irl.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  return count.toLocaleString();
}

export function VotingBar({ tally, showLabels = false }: VotingBarProps) {
  const sections = parseTally(tally);
  const total = sections.reduce((sum, s) => sum + s.count, 0);

  if (total === 0) {
    return (
      <div className="space-y-2">
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="flex h-full items-center justify-center">
            <span className="text-[10px] text-muted-foreground">
              No votes yet
            </span>
          </div>
        </div>
        {showLabels && (
          <div className="flex gap-4 text-xs text-muted-foreground">
            {sections.map((s) => (
              <span key={s.label} className="flex items-center gap-1">
                <span
                  className={`inline-block size-2 rounded-full ${s.color}`}
                />
                {s.label}: 0
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {sections.map(
          (section) =>
            section.percentage > 0 && (
              <motion.div
                key={section.label}
                className={`h-full ${section.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${section.percentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                title={`${section.label}: ${section.percentage.toFixed(1)}%`}
              />
            ),
        )}
      </div>
      {showLabels && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {sections.map((s) => (
            <span key={s.label} className="flex items-center gap-1">
              <span className={`inline-block size-2 rounded-full ${s.color}`} />
              <span className="text-muted-foreground">{s.label}:</span>
              <span className={`font-mono font-medium ${s.textColor}`}>
                {formatVoteCount(s.count)} ({s.percentage.toFixed(1)}%)
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
