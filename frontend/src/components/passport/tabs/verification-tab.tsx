"use client";

import {
  ShieldCheck,
  Clock,
  XCircle,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import { GlassCard, CopyButton } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import type { VerificationInfo } from "@/lib/api/passport-types";

interface VerificationTabProps {
  data: VerificationInfo;
}

const statusConfig = {
  verified: {
    icon: ShieldCheck,
    label: "Verified",
    color: "bg-integra-success/10 text-integra-success",
    badgeClass:
      "bg-integra-success/10 text-integra-success border-integra-success/30",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    color: "bg-integra-warning/10 text-integra-warning",
    badgeClass:
      "bg-integra-warning/10 text-integra-warning border-integra-warning/30",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "bg-integra-danger/10 text-integra-danger",
    badgeClass:
      "bg-integra-danger/10 text-integra-danger border-integra-danger/30",
  },
};

export function VerificationTab({ data }: VerificationTabProps) {
  const verifiedCount = data.attestations.filter(
    (a) => a.verificationStatus === "verified",
  ).length;
  const pendingCount = data.attestations.filter(
    (a) => a.verificationStatus === "pending",
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-brand/10">
              <FileText className="size-5 text-integra-brand" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Attestations
              </p>
              <p className="text-xl font-bold">{data.attestations.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-success/10">
              <ShieldCheck className="size-5 text-integra-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              <p className="text-xl font-bold">{verifiedCount}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-warning/10">
              <Clock className="size-5 text-integra-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Attestation cards */}
      {data.attestations.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.attestations.map((attestation, i) => {
            const config = statusConfig[attestation.verificationStatus];
            const StatusIcon = config.icon;

            return (
              <GlassCard key={i} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      className={`size-5 ${config.color.split(" ")[1]}`}
                    />
                    <h4 className="font-semibold">
                      {attestation.documentType}
                    </h4>
                  </div>
                  <Badge variant="outline" className={config.badgeClass}>
                    {config.label}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {/* Verifier info */}
                  <div>
                    <p className="text-xs text-muted-foreground">Verified by</p>
                    <p className="text-sm font-medium">
                      {attestation.verifier.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {attestation.verifier.type}
                    </p>
                  </div>

                  {/* IPFS hash */}
                  <div>
                    <p className="text-xs text-muted-foreground">IPFS Hash</p>
                    <div className="flex items-center gap-1">
                      <p className="truncate font-mono text-xs">
                        {attestation.ipfsHash}
                      </p>
                      <CopyButton text={attestation.ipfsHash} />
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div>
                    <p className="text-xs text-muted-foreground">Timestamp</p>
                    <p className="text-sm">
                      {new Date(attestation.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <a
                      href={`https://ipfs.io/ipfs/${attestation.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/80"
                    >
                      <ExternalLink className="size-3" />
                      View on IPFS
                    </a>
                    {attestation.downloadUrl && (
                      <a
                        href={attestation.downloadUrl}
                        className="inline-flex items-center gap-1 rounded-md bg-integra-brand/10 px-3 py-1.5 text-xs font-medium text-integra-brand transition-colors hover:bg-integra-brand/20"
                      >
                        <Download className="size-3" />
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShieldCheck className="mb-2 size-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              No attestations available for this passport.
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
