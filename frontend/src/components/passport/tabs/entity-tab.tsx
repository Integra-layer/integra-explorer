"use client";

import { Building, FileText, Vote, Fingerprint } from "lucide-react";
import { GlassCard, CopyButton } from "@/components/effects";
import type { EntityInfo } from "@/lib/api/passport-types";

interface EntityTabProps {
  data: EntityInfo;
}

export function EntityTab({ data }: EntityTabProps) {
  return (
    <div className="space-y-6">
      {/* Developer card */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-integra-brand/10">
            <Building className="size-5 text-integra-brand" />
          </div>
          <h3 className="text-lg font-semibold">Developer</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-lg font-medium">{data.developer.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="leading-relaxed text-muted-foreground">
              {data.developer.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">
                Registration Number
              </p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-medium">
                  {data.developer.registrationNumber}
                </p>
                <CopyButton text={data.developer.registrationNumber} />
              </div>
            </div>

            {data.developer.did && (
              <div>
                <p className="text-sm text-muted-foreground">
                  <Fingerprint className="mr-1 inline size-3.5" />
                  Decentralized Identifier (DID)
                </p>
                <div className="flex items-center gap-2">
                  <p className="truncate font-mono text-sm font-medium">
                    {data.developer.did}
                  </p>
                  <CopyButton text={data.developer.did} />
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Governance card */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-integra-info/10">
            <Vote className="size-5 text-integra-info" />
          </div>
          <h3 className="text-lg font-semibold">Governance</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              <FileText className="mr-1 inline size-3.5" />
              Governance Rules
            </p>
            <p className="leading-relaxed text-foreground">
              {data.governance.rules}
            </p>
          </div>

          {data.governance.votingMechanism && (
            <div>
              <p className="text-sm text-muted-foreground">Voting Mechanism</p>
              <p className="font-medium">{data.governance.votingMechanism}</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
