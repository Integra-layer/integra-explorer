"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileKey2, Lock, Unlock, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  GlassCard,
  PageTransition,
  SkeletonShimmer,
} from "@/components/effects";
import { getPassports } from "@/lib/api/passport";
import type { AssetPassport } from "@/lib/api/passport-types";

const statusColors: Record<string, string> = {
  active:
    "bg-integra-success/10 text-integra-success border-integra-success/30",
  pending:
    "bg-integra-warning/10 text-integra-warning border-integra-warning/30",
  archived: "bg-muted text-muted-foreground border-muted",
};

export default function PassportListPage() {
  const [passports, setPassports] = useState<AssetPassport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPassports()
      .then(setPassports)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <section className="container mx-auto space-y-6 px-4 py-8">
        {/* Page heading */}
        <div className="flex items-center gap-3">
          <FileKey2 className="size-6 text-integra-brand" />
          <h1 className="text-2xl font-bold tracking-tight">Asset Passports</h1>
          {passports.length > 0 && (
            <Badge variant="secondary" className="font-mono">
              {passports.length}
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Tokenized real-world asset passports on Integra Layer. Each passport
          contains verified property, financial, and on-chain data.
        </p>

        {/* Loading state */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonShimmer key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : passports.length === 0 ? (
          /* Empty state */
          <GlassCard className="p-8">
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <FileKey2 className="size-12 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold">
                  No Passports Available
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Asset passports will appear here once the passport service is
                  connected. Check back soon or contact the development team.
                </p>
              </div>
            </div>
          </GlassCard>
        ) : (
          /* Passport table */
          <GlassCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted bg-muted/30">
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">
                      Asset Name
                    </th>
                    <th className="px-6 py-4 text-center font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="px-6 py-4 text-center font-medium text-muted-foreground">
                      Access
                    </th>
                    <th className="px-6 py-4 text-right font-medium text-muted-foreground">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {passports.map((passport) => (
                    <tr
                      key={passport.id}
                      className="border-b border-muted/50 transition-colors last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/passport/${passport.id}`}
                          className="font-mono text-sm text-integra-brand hover:underline"
                        >
                          {passport.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/passport/${passport.id}`}
                          className="font-medium hover:text-integra-brand"
                        >
                          {passport.assetName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={statusColors[passport.status]}
                        >
                          {passport.status.charAt(0).toUpperCase() +
                            passport.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm">
                          {passport.asset.propertyType}
                        </span>
                        {passport.isMaster && (
                          <Crown className="ml-1 inline size-3.5 text-amber-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {passport.isPrivate ? (
                          <Lock className="mx-auto size-4 text-muted-foreground" />
                        ) : (
                          <Unlock className="mx-auto size-4 text-integra-success" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {new Date(passport.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </section>
    </PageTransition>
  );
}
