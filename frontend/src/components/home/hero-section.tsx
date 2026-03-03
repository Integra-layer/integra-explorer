"use client";

import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/effects";
import { SearchBar } from "@/components/search/search-bar";
import { StatsGrid } from "./stats-grid";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden md:min-h-[60vh]">
      {/* Background decoration — animated beams */}
      <BackgroundBeams className="opacity-30" />

      {/* Animated gradient orb */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="size-[600px] animate-pulse rounded-full bg-gradient-to-r from-integra-brand/5 via-integra-pink/5 to-integra-brand/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center gap-6 px-4 py-16 text-center md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Integra{" "}
            <span className="gradient-brand-text-animated">Explorer</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-lg text-base text-muted-foreground sm:text-lg"
        >
          Search and explore the Integra Layer blockchain: blocks, transactions,
          tokens, and more.
        </motion.p>

        {/* Hero search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SearchBar variant="hero" className="mt-2" />
        </motion.div>

        {/* Stats grid below search */}
        <StatsGrid />
      </div>
    </section>
  );
}
