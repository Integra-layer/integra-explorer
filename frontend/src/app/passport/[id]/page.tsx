"use client";

import { use, useEffect, useState } from "react";
import { Lock, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { PageTransition, GlassCard, SkeletonShimmer } from "@/components/effects";
import { PassportViewer } from "@/components/passport/passport-viewer";
import { getPassport, verifyPassportPassword } from "@/lib/api/passport";
import type { AssetPassport } from "@/lib/api/passport-types";

interface PassportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PassportDetailPage({
  params,
}: PassportDetailPageProps) {
  const { id } = use(params);
  const [passport, setPassport] = useState<AssetPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    getPassport(id)
      .then((data) => {
        if (data) {
          setPassport(data);
          // Public passports are auto-unlocked
          if (!data.isPrivate) {
            setUnlocked(true);
          }
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setVerifying(true);
    setPasswordError(false);

    const isValid = await verifyPassportPassword(id, password);
    if (isValid) {
      setUnlocked(true);
    } else {
      setPasswordError(true);
    }
    setVerifying(false);
  };

  if (loading) {
    return (
      <PageTransition>
        <section className="container mx-auto space-y-6 px-4 py-8">
          <SkeletonShimmer className="h-32 rounded-xl" />
          <SkeletonShimmer className="h-12 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonShimmer key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </section>
      </PageTransition>
    );
  }

  if (error || !passport) {
    return (
      <PageTransition>
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <AlertCircle className="size-12 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Passport Not Found</h1>
            <p className="text-muted-foreground">
              Passport <span className="font-mono">{id}</span> could not be
              loaded.
            </p>
            <Link
              href="/passport"
              className="inline-flex items-center gap-2 text-sm text-integra-brand hover:underline"
            >
              <ArrowLeft className="size-4" />
              Back to Passports
            </Link>
          </div>
        </section>
      </PageTransition>
    );
  }

  // Private passport — password gate
  if (passport.isPrivate && !unlocked) {
    return (
      <PageTransition>
        <section className="container mx-auto px-4 py-8">
          <Link
            href="/passport"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Passports
          </Link>

          <div className="mx-auto max-w-md py-12">
            <GlassCard className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-integra-brand/10">
                  <Lock className="size-8 text-integra-brand" />
                </div>
                <h2 className="text-xl font-bold">Private Passport</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This passport is protected. Enter the password to view its
                  contents.
                </p>

                <form
                  onSubmit={handlePasswordSubmit}
                  className="mt-6 w-full space-y-4"
                >
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(false);
                      }}
                      placeholder="Enter password"
                      className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-integra-brand focus:ring-2 focus:ring-integra-brand/20"
                      autoFocus
                    />
                    {passwordError && (
                      <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle className="size-3.5" />
                        Incorrect password. Please try again.
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={verifying || !password.trim()}
                    className="w-full rounded-lg bg-integra-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-integra-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {verifying ? "Verifying..." : "Unlock Passport"}
                  </button>
                </form>

                <p className="mt-4 text-xs text-muted-foreground">
                  Hint: In development mode, use &quot;demo&quot; as the
                  password.
                </p>
              </div>
            </GlassCard>
          </div>
        </section>
      </PageTransition>
    );
  }

  // Unlocked — show full viewer
  return (
    <PageTransition>
      <section className="container mx-auto px-4 py-8">
        <Link
          href="/passport"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Passports
        </Link>

        <PassportViewer passport={passport} />
      </section>
    </PageTransition>
  );
}
