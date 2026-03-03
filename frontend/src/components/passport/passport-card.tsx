"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Unlock, Crown, Building, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/effects";
import type { AssetPassport } from "@/lib/api/passport-types";

interface PassportCardProps {
  passport: AssetPassport;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className:
      "bg-integra-success/10 text-integra-success border-integra-success/30",
  },
  pending: {
    label: "Pending",
    className:
      "bg-integra-warning/10 text-integra-warning border-integra-warning/30",
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground border-muted",
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}mo ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years}y ago`;
}

export function PassportCard({ passport }: PassportCardProps) {
  const status = statusConfig[passport.status] ?? statusConfig.archived;
  const verifiedCount = passport.verification.attestations.filter(
    (a) => a.verificationStatus === "verified",
  ).length;

  return (
    <Link href={`/passport/${passport.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <GlassCard className="flex h-full flex-col gap-4 p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {passport.isMaster && (
                  <Crown className="size-4 shrink-0 text-amber-500" />
                )}
                <h3 className="truncate font-semibold leading-tight">
                  {passport.assetName}
                </h3>
              </div>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {passport.id}
              </p>
            </div>
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          </div>

          {/* Property type + privacy */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building className="size-3.5" />
              {passport.asset.propertyType}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {passport.asset.location.city}, {passport.asset.location.country}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Footer row */}
          <div className="flex items-center justify-between text-xs">
            {/* Token standard */}
            <Badge variant="secondary" className="font-mono text-xs">
              {passport.tokenization.standard}
            </Badge>

            <div className="flex items-center gap-3">
              {/* Verified attestations */}
              {verifiedCount > 0 && (
                <span className="text-integra-success">
                  {verifiedCount} verified
                </span>
              )}

              {/* Privacy */}
              {passport.isPrivate ? (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Lock className="size-3.5" />
                  Private
                </span>
              ) : (
                <span className="flex items-center gap-1 text-integra-success">
                  <Unlock className="size-3.5" />
                  Public
                </span>
              )}

              {/* Created date */}
              <span className="text-muted-foreground">
                {formatDate(passport.createdAt)}
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </Link>
  );
}
