import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface DetailRowProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  /** "stacked" (default): label above value. "inline": label and value side-by-side. */
  variant?: "stacked" | "inline";
}

export function DetailRow({
  label,
  icon: Icon,
  hint,
  children,
  className,
  variant = "stacked",
}: DetailRowProps) {
  if (variant === "inline") {
    return (
      <div className={`flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}>
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="break-all text-sm font-medium">{children}</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
        {hint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-1 size-4 cursor-help rounded-full p-0 text-[9px]">?</Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">{hint}</TooltipContent>
          </Tooltip>
        )}
      </span>
      <div className="text-sm">{children}</div>
    </div>
  );
}
