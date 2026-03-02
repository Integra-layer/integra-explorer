"use client";

import { DotPattern } from "@/components/effects";
import { SearchBar } from "@/components/search/search-bar";
import { StatsGrid } from "./stats-grid";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden md:min-h-[60vh]">
      {/* Background decoration */}
      <DotPattern className="opacity-10" />

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center gap-6 px-4 py-16 text-center md:py-24">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Integra{" "}
          <span className="text-integra-brand">Explorer</span>
        </h1>
        <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
          Search and explore the Integra Layer blockchain
        </p>

        {/* Hero search bar */}
        <SearchBar variant="hero" className="mt-2" />

        {/* Stats grid below search */}
        <StatsGrid />
      </div>
    </section>
  );
}
