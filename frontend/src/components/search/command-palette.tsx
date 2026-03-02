"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Blocks,
  ArrowRightLeft,
  Users,
  Coins,
  FileText,
  Clock,
  Hash,
  Search,
  Trash2,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  detectSearchType,
  getSearchRoute,
  searchTypeLabels,
  type SearchType,
} from "@/lib/hooks/use-search-detect";

// ---------------------------------------------------------------------------
// Recent searches — persisted in localStorage
// ---------------------------------------------------------------------------

interface RecentSearch {
  query: string;
  type: SearchType;
  timestamp: number;
}

const STORAGE_KEY = "integra-explorer-recent-searches";
const MAX_RECENT = 5;

function loadRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSearch[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(entry: RecentSearch) {
  try {
    const existing = loadRecentSearches();
    // Remove duplicate if present
    const filtered = existing.filter(
      (s) => s.query.toLowerCase() !== entry.query.toLowerCase(),
    );
    const updated = [entry, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently ignore
  }
}

// ---------------------------------------------------------------------------
// Quick navigation links
// ---------------------------------------------------------------------------

const quickNavLinks = [
  { label: "Blocks", href: "/blocks", icon: Blocks },
  { label: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { label: "Validators", href: "/validators", icon: Users },
  { label: "Tokens", href: "/tokens", icon: Coins },
  { label: "Proposals", href: "/proposals", icon: FileText },
];

// ---------------------------------------------------------------------------
// Icon for detected search type
// ---------------------------------------------------------------------------

function searchTypeIcon(type: SearchType) {
  switch (type) {
    case "block":
      return <Blocks className="size-4" />;
    case "transaction":
      return <ArrowRightLeft className="size-4" />;
    case "address":
      return <Users className="size-4" />;
    case "token":
      return <Coins className="size-4" />;
    default:
      return <Search className="size-4" />;
  }
}

// ---------------------------------------------------------------------------
// CommandPalette
// ---------------------------------------------------------------------------

export interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Controlled vs uncontrolled open state
  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  // Load recent searches when dialog opens
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(loadRecentSearches());
      setQuery("");
    }
  }, [isOpen]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const detectedType = useMemo(() => detectSearchType(query), [query]);

  const navigateTo = useCallback(
    (path: string, searchQuery?: string) => {
      if (searchQuery) {
        const type = detectSearchType(searchQuery);
        saveRecentSearch({
          query: searchQuery.trim(),
          type,
          timestamp: Date.now(),
        });
      }
      setIsOpen(false);
      router.push(path);
    },
    [router, setIsOpen],
  );

  const handleSearchSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigateTo(getSearchRoute(trimmed), trimmed);
  }, [query, navigateTo]);

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Search"
      description="Search blocks, transactions, addresses, and more"
      showCloseButton={false}
    >
      <div className="relative">
        <CommandInput
          placeholder="Search blocks, transactions, addresses..."
          value={query}
          onValueChange={setQuery}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearchSubmit();
            }
          }}
        />
        {query.trim() && detectedType !== "unknown" && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <Badge variant="secondary" className="text-[10px] font-semibold">
              {searchTypeLabels[detectedType]}
            </Badge>
          </div>
        )}
      </div>

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Go-to action when query is present */}
        {query.trim() && (
          <CommandGroup heading="Go to">
            <CommandItem
              onSelect={handleSearchSubmit}
              className="gap-2"
            >
              {searchTypeIcon(detectedType)}
              <span>
                {detectedType !== "unknown"
                  ? `Go to ${searchTypeLabels[detectedType]}: `
                  : "Search for: "}
                <span className="font-mono text-xs text-muted-foreground">
                  {query.trim().length > 20
                    ? `${query.trim().slice(0, 10)}...${query.trim().slice(-8)}`
                    : query.trim()}
                </span>
              </span>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Recent searches */}
        {!query.trim() && recentSearches.length > 0 && (
          <>
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((recent) => (
                <CommandItem
                  key={`${recent.query}-${recent.timestamp}`}
                  onSelect={() =>
                    navigateTo(getSearchRoute(recent.query), recent.query)
                  }
                  className="gap-2"
                >
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="flex-1 truncate font-mono text-xs">
                    {recent.query}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px]"
                  >
                    {searchTypeLabels[recent.type]}
                  </Badge>
                </CommandItem>
              ))}
              <CommandItem
                onSelect={handleClearRecent}
                className="gap-2 text-muted-foreground"
              >
                <Trash2 className="size-4" />
                <span className="text-xs">Clear recent searches</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Quick navigation */}
        {!query.trim() && (
          <CommandGroup heading="Quick Navigation">
            {quickNavLinks.map((link) => (
              <CommandItem
                key={link.href}
                onSelect={() => navigateTo(link.href)}
                className="gap-2"
              >
                <link.icon className="size-4" />
                <span>{link.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Shortcut hint at the bottom */}
        {!query.trim() && (
          <div className="flex items-center justify-center gap-2 border-t px-3 py-2 text-xs text-muted-foreground">
            <Hash className="size-3" />
            <span>Type a block number, tx hash, or address</span>
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
