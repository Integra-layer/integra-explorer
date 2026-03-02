"use client";

import dynamic from "next/dynamic";
import {
  Building2,
  Building,
  LayoutGrid,
  DollarSign,
  Users,
  Coins,
  ShieldCheck,
  History,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GlassCard, CopyButton } from "@/components/effects";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssetPassport } from "@/lib/api/passport-types";

// Lazy-load passport tabs for performance — only the active tab is rendered
const TabLoading = () => <Skeleton className="h-48 w-full rounded-xl" />;

const AssetTab = dynamic(
  () => import("./tabs/asset-tab").then((m) => ({ default: m.AssetTab })),
  { loading: TabLoading },
);
const EntityTab = dynamic(
  () => import("./tabs/entity-tab").then((m) => ({ default: m.EntityTab })),
  { loading: TabLoading },
);
const PropertyTab = dynamic(
  () => import("./tabs/property-tab").then((m) => ({ default: m.PropertyTab })),
  { loading: TabLoading },
);
const ValuationTab = dynamic(
  () =>
    import("./tabs/valuation-tab").then((m) => ({ default: m.ValuationTab })),
  { loading: TabLoading },
);
const StakeholderTab = dynamic(
  () =>
    import("./tabs/stakeholder-tab").then((m) => ({
      default: m.StakeholderTab,
    })),
  { loading: TabLoading },
);
const TokenizationTab = dynamic(
  () =>
    import("./tabs/tokenization-tab").then((m) => ({
      default: m.TokenizationTab,
    })),
  { loading: TabLoading },
);
const VerificationTab = dynamic(
  () =>
    import("./tabs/verification-tab").then((m) => ({
      default: m.VerificationTab,
    })),
  { loading: TabLoading },
);
const HistoryTab = dynamic(
  () => import("./tabs/history-tab").then((m) => ({ default: m.HistoryTab })),
  { loading: TabLoading },
);

interface PassportViewerProps {
  passport: AssetPassport;
}

const statusColors: Record<string, string> = {
  active:
    "bg-integra-success/10 text-integra-success border-integra-success/30",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  archived: "bg-muted text-muted-foreground border-muted",
};

export function PassportViewer({ passport }: PassportViewerProps) {
  const fieldPrivacy = passport.metadata?.fieldPrivacy ?? {};

  return (
    <div className="space-y-6">
      {/* Passport header */}
      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {passport.assetName}
              </h1>
              <Badge
                variant="outline"
                className={statusColors[passport.status]}
              >
                {passport.status.charAt(0).toUpperCase() +
                  passport.status.slice(1)}
              </Badge>
              {passport.isMaster && <Badge variant="secondary">Master</Badge>}
              {passport.isPrivate && <Badge variant="outline">Private</Badge>}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>ID: {passport.id}</span>
              <CopyButton text={passport.id} />
            </div>
          </div>

          <div className="text-right text-sm text-muted-foreground">
            <p>Created: {new Date(passport.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(passport.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Chain-of-custody parent IDs */}
        {passport.master && passport.master.length > 0 && (
          <div className="mt-4 border-t border-muted pt-4">
            <p className="text-sm text-muted-foreground">
              Parent Passport{passport.master.length > 1 ? "s" : ""}:{" "}
              {passport.master.map((id, i) => (
                <span key={id}>
                  <a
                    href={`/passport/${id}`}
                    className="font-mono text-integra-brand hover:underline"
                  >
                    {id}
                  </a>
                  {i < passport.master!.length - 1 && ", "}
                </span>
              ))}
            </p>
          </div>
        )}
      </GlassCard>

      {/* 8-tab viewer */}
      <Tabs defaultValue="asset">
        <TabsList className="w-full flex-wrap" variant="line">
          <TabsTrigger value="asset" className="gap-1.5">
            <Building2 className="size-4" />
            <span className="hidden sm:inline">Asset</span>
          </TabsTrigger>
          <TabsTrigger value="entity" className="gap-1.5">
            <Building className="size-4" />
            <span className="hidden sm:inline">Entity</span>
          </TabsTrigger>
          <TabsTrigger value="property" className="gap-1.5">
            <LayoutGrid className="size-4" />
            <span className="hidden sm:inline">Property</span>
          </TabsTrigger>
          <TabsTrigger value="valuation" className="gap-1.5">
            <DollarSign className="size-4" />
            <span className="hidden sm:inline">Valuation</span>
          </TabsTrigger>
          <TabsTrigger value="stakeholders" className="gap-1.5">
            <Users className="size-4" />
            <span className="hidden sm:inline">Stakeholders</span>
          </TabsTrigger>
          <TabsTrigger value="tokenization" className="gap-1.5">
            <Coins className="size-4" />
            <span className="hidden sm:inline">Tokenization</span>
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-1.5">
            <ShieldCheck className="size-4" />
            <span className="hidden sm:inline">Verification</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="size-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="asset" className="mt-6">
          <AssetTab data={passport.asset} fieldPrivacy={fieldPrivacy} />
        </TabsContent>

        <TabsContent value="entity" className="mt-6">
          <EntityTab data={passport.entity} />
        </TabsContent>

        <TabsContent value="property" className="mt-6">
          <PropertyTab data={passport.property} />
        </TabsContent>

        <TabsContent value="valuation" className="mt-6">
          <ValuationTab data={passport.valuation} fieldPrivacy={fieldPrivacy} />
        </TabsContent>

        <TabsContent value="stakeholders" className="mt-6">
          <StakeholderTab
            data={passport.stakeholders}
            fieldPrivacy={fieldPrivacy}
          />
        </TabsContent>

        <TabsContent value="tokenization" className="mt-6">
          <TokenizationTab data={passport.tokenization} />
        </TabsContent>

        <TabsContent value="verification" className="mt-6">
          <VerificationTab data={passport.verification} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <HistoryTab data={passport.history} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
