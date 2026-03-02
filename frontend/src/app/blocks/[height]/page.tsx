"use client";

import { use } from "react";
import { PageTransition } from "@/components/effects";
import { BlockDetail } from "@/components/blocks/block-detail";
import { useBlock } from "@/lib/hooks/use-blocks";

interface BlockPageProps {
  params: Promise<{ height: string }>;
}

export default function BlockPage({ params }: BlockPageProps) {
  const { height } = use(params);
  const blockNumber = Number(height);
  const { data: block, isLoading, error } = useBlock(blockNumber);

  if (error) {
    return (
      <PageTransition>
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <h1 className="text-2xl font-bold">Block Not Found</h1>
            <p className="text-muted-foreground">
              Block #{blockNumber.toLocaleString()} could not be loaded.
            </p>
          </div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <section className="container mx-auto px-4 py-8">
        <BlockDetail block={block} isLoading={isLoading} />
      </section>
    </PageTransition>
  );
}
