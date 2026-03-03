"use client";

import { useEffect, useRef, useState } from "react";
import { FileKey2, Shield } from "lucide-react";
import { motion } from "framer-motion";
import {
  GlassCard,
  PageTransition,
  SkeletonShimmer,
  GradientButton,
} from "@/components/effects";
import { PassportCard } from "@/components/passport/passport-card";
import { getPassports } from "@/lib/api/passport";
import type { AssetPassport } from "@/lib/api/passport-types";

function StatPill({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border/50 bg-white/[0.04] px-6 py-4">
      <span className="text-2xl font-bold tabular-nums text-foreground">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function PassportListPage() {
  const [passports, setPassports] = useState<AssetPassport[]>([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPassports()
      .then(setPassports)
      .finally(() => setLoading(false));
  }, []);

  const verifiedCount = passports.reduce((acc, p) => {
    const count = p.verification.attestations.filter(
      (a) => a.verificationStatus === "verified",
    ).length;
    return acc + (count > 0 ? 1 : 0);
  }, 0);

  const activeCount = passports.filter((p) => p.status === "active").length;

  function scrollToGrid() {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <PageTransition>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-integra-brand/[0.06] to-transparent px-4 py-20">
        {/* Subtle radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-[400px] w-[600px] rounded-full bg-integra-brand/10 blur-[120px]" />
        </div>

        <div className="container relative mx-auto flex flex-col items-center gap-8 text-center">
          {/* Icon badge */}
          <div className="flex size-14 items-center justify-center rounded-2xl border border-integra-brand/30 bg-integra-brand/10">
            <FileKey2 className="size-7 text-integra-brand" />
          </div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Asset{" "}
              <span className="bg-gradient-to-r from-integra-brand to-integra-pink bg-clip-text text-transparent">
                Passports
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
              Tokenized real-world asset passports on Integra Layer. Verified
              property, financial, and on-chain data — all in one place.
            </p>
          </motion.div>

          {/* Stats row */}
          {!loading && passports.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <StatPill label="Total Passports" value={passports.length} />
              <StatPill label="Verified" value={verifiedCount} />
              <StatPill label="Active" value={activeCount} />
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <GradientButton onClick={scrollToGrid}>
              Explore Passports
            </GradientButton>
          </motion.div>
        </div>
      </section>

      {/* ── Live Feed ── */}
      <section
        ref={gridRef}
        className="container mx-auto space-y-6 px-4 py-12"
      >
        <div className="flex items-center gap-3">
          <Shield className="size-5 text-integra-brand" />
          <h2 className="text-xl font-semibold tracking-tight">
            Recently Created Passports
          </h2>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonShimmer key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : passports.length === 0 ? (
          /* Empty state */
          <GlassCard className="p-8">
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <FileKey2 className="size-12 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold">No Passports Available</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Asset passports will appear here once the passport service is
                  connected. Check back soon or contact the development team.
                </p>
              </div>
            </div>
          </GlassCard>
        ) : (
          /* Passport grid */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {passports.map((passport, i) => (
              <motion.div
                key={passport.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
              >
                <PassportCard passport={passport} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  );
}
