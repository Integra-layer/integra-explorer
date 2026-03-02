"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { SearchBar } from "@/components/search/search-bar";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Blocks", href: "/blocks" },
  { label: "Transactions", href: "/transactions" },
  { label: "Validators", href: "/validators" },
  { label: "Tokens", href: "/tokens" },
  { label: "Proposals", href: "/proposals" },
  { label: "Developers", href: "/developers" },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <>
      <Image
        src="/logos/integra-mark.svg"
        alt="Integra"
        width={size}
        height={size}
        className="dark:hidden"
      />
      <Image
        src="/logos/integra-mark-white.svg"
        alt="Integra"
        width={size}
        height={size}
        className="hidden dark:block"
      />
    </>
  );
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-[#0A0A0F]/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Left: Logo + Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight"
        >
          <LogoMark size={30} />
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-extrabold tracking-wide">
              INTEGRA
            </span>
            <span className="gradient-brand-text text-[10px] font-bold tracking-[0.2em] uppercase">
              Explorer
            </span>
          </div>
        </Link>

        {/* Center: Desktop nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActiveLink(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-1.5 text-sm font-medium transition-colors hover:text-integra-brand",
                  active ? "text-integra-brand" : "text-muted-foreground",
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-integra-brand" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions — gap-2 mobile, gap-3 desktop */}
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <SearchBar variant="nav" className="hidden sm:flex" />
          <Button
            className="hidden bg-gradient-to-r from-integra-pink to-integra-brand text-white hover:opacity-90 sm:flex"
            size="sm"
          >
            Connect Wallet
          </Button>

          {/* Mobile: Hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5 font-bold tracking-tight">
                  <LogoMark size={30} />
                  <div className="flex flex-col leading-none">
                    <span className="text-[15px] font-extrabold tracking-wide">
                      INTEGRA
                    </span>
                    <span className="gradient-brand-text text-[10px] font-bold tracking-[0.2em] uppercase">
                      Explorer
                    </span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => {
                  const active = isActiveLink(pathname, link.href);
                  return (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                          active
                            ? "bg-muted text-integra-brand"
                            : "text-muted-foreground",
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
              <div className="mt-4 px-4">
                <Button
                  className="w-full bg-gradient-to-r from-integra-pink to-integra-brand text-white hover:opacity-90"
                  size="sm"
                >
                  Connect Wallet
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
