import type { Metadata } from "next";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { HeroSection } from "@/components/home/hero-section";
import { LatestBlocks } from "@/components/home/latest-blocks";
import { LatestTransactions } from "@/components/home/latest-transactions";
import { getStats } from "@/lib/api/stats";
import { getBlocks } from "@/lib/api/blocks";
import { getTransactions } from "@/lib/api/transactions";

export const metadata: Metadata = {
  title: "Integra Explorer — Blockchain Explorer for Integra Layer",
  description:
    "Explore blocks, transactions, validators, and smart contracts on the Integra Layer blockchain",
};

export default async function Home() {
  const queryClient = new QueryClient();
  await Promise.allSettled([
    queryClient.prefetchQuery({ queryKey: ["stats"], queryFn: getStats }),
    queryClient.prefetchQuery({
      queryKey: ["blocks", 1, 1],
      queryFn: () => getBlocks({ page: 1, itemsPerPage: 1 }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["blocks", 1, 6],
      queryFn: () => getBlocks({ page: 1, itemsPerPage: 6 }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["transactions", 1, 6],
      queryFn: () => getTransactions({ page: 1, itemsPerPage: 6 }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HeroSection />
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LatestBlocks />
          <LatestTransactions />
        </div>
      </section>
    </HydrationBoundary>
  );
}
