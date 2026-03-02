"use client";

import {
  BookOpen,
  Github,
  Droplets,
  Search,
  Globe,
  Palette,
  Wallet,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import {
  GlassCard,
  HoverLift,
  PageTransition,
} from "@/components/effects";

/* ------------------------------------------------------------------ */
/*  Resource definitions                                              */
/* ------------------------------------------------------------------ */

interface Resource {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  external: boolean;
  details?: string;
}

const RESOURCES: Resource[] = [
  {
    title: "Documentation",
    description: "Official Integra Layer documentation",
    href: "https://docs.integralayer.com",
    icon: BookOpen,
    external: true,
  },
  {
    title: "GitHub",
    description: "Explore our open-source repositories",
    href: "https://github.com/Integra-layer",
    icon: Github,
    external: true,
  },
  {
    title: "Testnet Faucet",
    description: "Get testnet tokens for development",
    href: "/faucet",
    icon: Droplets,
    external: false,
  },
  {
    title: "Block Explorer",
    description: "Explore blocks, transactions, and more",
    href: "/",
    icon: Search,
    external: false,
  },
  {
    title: "Integra Portal",
    description: "Main portal for Integra Layer",
    href: "https://testnet.integralayer.com",
    icon: Globe,
    external: true,
  },
  {
    title: "Brand Kit",
    description: "Official brand guidelines and assets",
    href: "https://github.com/Integra-layer/integra-brand",
    icon: Palette,
    external: true,
  },
  {
    title: "Wallet Setup",
    description: "Configure MetaMask for Integra",
    href: "https://testnet.integralayer.com",
    icon: Wallet,
    external: true,
    details: "Chain ID: 26218 | RPC: testnet.integralayer.com/evm",
  },
  {
    title: "Blockscout",
    description: "EVM-focused block explorer",
    href: "https://testnet.blockscout.integralayer.com",
    icon: Search,
    external: true,
  },
];

/* ================================================================== */
/*  Page                                                              */
/* ================================================================== */

export default function ResourcesPage() {
  return (
    <PageTransition>
      <section className="container mx-auto space-y-8 px-4 py-8">
        {/* Heading */}
        <div>
          <div className="flex items-center gap-3">
            <BookOpen className="size-6 text-integra-brand" />
            <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Explore the Integra Layer ecosystem. Find documentation, tools, and community resources
            to build on Integra.
          </p>
        </div>

        {/* Card grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((resource) => (
            <ResourceCard key={resource.title} resource={resource} />
          ))}
        </div>
      </section>
    </PageTransition>
  );
}

/* ================================================================== */
/*  Resource Card                                                     */
/* ================================================================== */

function ResourceCard({ resource }: { resource: Resource }) {
  const Icon = resource.icon;
  const linkProps = resource.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <HoverLift>
      <a href={resource.href} {...linkProps} className="block h-full">
        <GlassCard className="flex h-full flex-col p-5">
          <div className="flex items-start justify-between">
            <div className="flex size-11 items-center justify-center rounded-xl bg-integra-brand/10">
              <Icon className="size-5 text-integra-brand" />
            </div>
            {resource.external && (
              <ExternalLink className="size-4 text-muted-foreground" />
            )}
          </div>

          <div className="mt-4 flex-1">
            <h3 className="font-semibold">{resource.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
          </div>

          {resource.details && (
            <p className="mt-3 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-muted-foreground">
              {resource.details}
            </p>
          )}
        </GlassCard>
      </a>
    </HoverLift>
  );
}
