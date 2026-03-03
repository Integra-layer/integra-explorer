import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { LatestBlocks } from "@/components/home/latest-blocks";
import { LatestTransactions } from "@/components/home/latest-transactions";

export const metadata: Metadata = {
  title: "Integra Explorer — Blockchain Explorer for Integra Layer",
  description:
    "Explore blocks, transactions, validators, and smart contracts on the Integra Layer blockchain",
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LatestBlocks />
          <LatestTransactions />
        </div>
      </section>
    </>
  );
}
