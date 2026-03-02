import Link from "next/link";
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
      { label: "GitHub", href: "#", external: true },
      { label: "Twitter / X", href: "#", external: true },
      { label: "Discord", href: "#", external: true },
      { label: "Telegram", href: "#", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Integra Layer", href: "#", external: true },
      { label: "Documentation", href: "#", external: true },
      { label: "Brand Kit", href: "#", external: true },
      { label: "Contact", href: "#", external: true },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
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
          <p>Powered by Ethernal</p>
        </div>
      </div>
    </footer>
  );
}
