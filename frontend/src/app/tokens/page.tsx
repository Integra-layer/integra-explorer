"use client";

import { Suspense } from "react";
import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/effects";
import { TokenList } from "@/components/tokens/token-list";
import { useKnownTokens } from "@/lib/hooks/use-tokens";

function TokensPageContent() {
  const { data: tokens, isLoading } = useKnownTokens();
  const count = tokens?.length ?? 0;

  return (
    <PageTransition>
      <section className="container mx-auto space-y-6 px-4 py-8">
        {/* Page heading */}
        <div className="flex items-center gap-3">
          <Coins className="size-6 text-integra-brand" />
          <h1 className="text-2xl font-bold tracking-tight">Tokens</h1>
          {count > 0 && (
            <Badge variant="secondary" className="font-mono">
              {count}
            </Badge>
          )}
        </div>

        {/* Token list */}
        <TokenList tokens={tokens ?? []} isLoading={isLoading} />
      </section>
    </PageTransition>
  );
}

export default function TokensPage() {
  return (
    <Suspense>
      <TokensPageContent />
    </Suspense>
  );
}
