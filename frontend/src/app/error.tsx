"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 text-center">
      {/* Branded accent line */}
      <div className="mb-8 h-1 w-24 rounded-full bg-gradient-to-r from-integra-brand to-integra-pink" />

      <h1 className="mb-2 text-6xl font-bold text-foreground">500</h1>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">
        Something went wrong
      </h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        An unexpected error occurred while loading this page. Please try again
        or return to the explorer.
      </p>

      {/* Error details — development only */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-8 max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-left">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-destructive">
            Error details (dev only)
          </p>
          <p className="break-all font-mono text-sm text-destructive/80">
            {error.message}
          </p>
          {error.digest && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Digest: {error.digest}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-integra-brand px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Back to explorer
        </Link>
      </div>
    </div>
  );
}
