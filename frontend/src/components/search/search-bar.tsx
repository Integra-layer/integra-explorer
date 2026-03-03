"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CommandPalette } from "./command-palette";
import {
  detectSearchType,
  getSearchRoute,
  searchTypeLabels,
} from "@/lib/hooks/use-search-detect";

// ---------------------------------------------------------------------------
// SearchBar
// ---------------------------------------------------------------------------

export interface SearchBarProps {
  variant?: "hero" | "nav";
  className?: string;
}

export function SearchBar({ variant = "nav", className }: SearchBarProps) {
  const [commandOpen, setCommandOpen] = useState(false);

  if (variant === "hero") {
    return (
      <>
        <HeroSearch
          className={className}
          onOpenCommand={() => setCommandOpen(true)}
        />
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      </>
    );
  }

  return (
    <>
      <NavSearch
        className={className}
        onOpenCommand={() => setCommandOpen(true)}
      />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}

// ---------------------------------------------------------------------------
// HeroSearch — large, centered input for home page
// ---------------------------------------------------------------------------

interface InternalSearchProps {
  className?: string;
  onOpenCommand: () => void;
}

function HeroSearch({ className, onOpenCommand }: InternalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const detectedType = useMemo(() => detectSearchType(query), [query]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      router.push(getSearchRoute(trimmed));
    },
    [query, router],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenCommand();
      }
    },
    [onOpenCommand],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("mx-auto w-full max-w-3xl", className)}
    >
      <div
        className={cn(
          "relative flex items-center rounded-xl border bg-background/60 backdrop-blur-sm transition-all duration-300",
          focused
            ? "border-integra-brand ring-2 ring-integra-brand/20 shadow-[0_0_30px_rgba(255,109,73,0.15)] scale-[1.02]"
            : "border-border hover:border-muted-foreground/30 hover:shadow-[0_0_15px_rgba(255,109,73,0.05)]",
        )}
      >
        <Search className="ml-4 size-5 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search any address, transaction, or block..."
          className="h-12 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground sm:h-14 sm:text-base"
          aria-label="Search the blockchain"
        />
        {query.trim() && detectedType !== "unknown" && (
          <Badge
            variant="secondary"
            className="mr-3 shrink-0 text-[10px] font-semibold"
          >
            {searchTypeLabels[detectedType]}
          </Badge>
        )}
        {!query.trim() && (
          <button
            type="button"
            onClick={onOpenCommand}
            className="mr-3 flex shrink-0 items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <span className="text-xs">&#8984;K</span>
          </button>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// NavSearch — compact icon button for navbar
// ---------------------------------------------------------------------------

function NavSearch({ className, onOpenCommand }: InternalSearchProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Search (Cmd+K)"
      onClick={onOpenCommand}
      className={cn("relative active:scale-95 transition-transform", className)}
    >
      <Search className="size-4" />
      <span className="absolute -bottom-0.5 right-0 text-[8px] font-medium text-muted-foreground">
        &#8984;K
      </span>
    </Button>
  );
}
