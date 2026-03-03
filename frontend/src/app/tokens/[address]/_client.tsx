"use client";

import { use } from "react";
import { PageTransition } from "@/components/effects";
import { TokenDetail } from "@/components/tokens/token-detail";

interface TokenPageClientProps {
  params: Promise<{ address: string }>;
}

export default function TokenPageClient({ params }: TokenPageClientProps) {
  const { address } = use(params);

  return (
    <PageTransition>
      <section className="container mx-auto px-4 py-8">
        <TokenDetail address={address} />
      </section>
    </PageTransition>
  );
}
