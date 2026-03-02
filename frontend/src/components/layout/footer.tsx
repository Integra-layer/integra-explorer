import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerSections = [
  {
    title: "Explorer",
    links: [
      { label: "Blocks", href: "/blocks" },
      { label: "Transactions", href: "/transactions" },
      { label: "Validators", href: "/validators" },
      { label: "Tokens", href: "/tokens" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Developers", href: "/developers" },
      { label: "Faucet", href: "/developers#faucet" },
      { label: "Resources", href: "/developers#resources" },
      { label: "Proposals", href: "/proposals" },
    ],
  },
  {
    title: "Community",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Integra-layer",
        external: true,
      },
      {
        label: "Twitter / X",
        href: "https://lnk.integralayer.com/x",
        external: true,
      },
      {
        label: "Discord",
        href: "https://lnk.integralayer.com/discord",
        external: true,
      },
      {
        label: "Telegram",
        href: "https://lnk.integralayer.com/telegram",
        external: true,
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        label: "Whitepaper",
        href: "https://whitepaper.integralayer.com",
        external: true,
      },
      {
        label: "Blog",
        href: "https://integralayer.com/blog",
        external: true,
      },
      {
        label: "Brand Kit",
        href: "https://integralayer.com/brandkit",
        external: true,
      },
      {
        label: "Portal",
        href: "https://testnet.integralayer.com",
        external: true,
      },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        {/* Top: Logo + description */}
        <div className="mb-8 flex items-center gap-3">
          <Image
            src="/logos/integra-mark.svg"
            alt="Integra"
            width={24}
            height={24}
            className="dark:hidden"
          />
          <Image
            src="/logos/integra-mark-white.svg"
            alt="Integra"
            width={24}
            height={24}
            className="hidden dark:block"
          />
          <span className="gradient-brand-text text-sm font-bold">
            INTEGRA EXPLORER
          </span>
        </div>

        {/* Link grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; 2026 Integra Layer. All rights reserved.</p>
          <span className="text-[10px] text-muted-foreground/40">
            Powered by Ethernal
          </span>
        </div>
      </div>
    </footer>
  );
}
