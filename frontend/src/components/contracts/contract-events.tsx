"use client";

import { GlassCard } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import type { AbiFunction } from "@/lib/api/contracts";

interface ContractEventsProps {
  events: AbiFunction[];
}

export function ContractEvents({ events }: ContractEventsProps) {
  if (events.length === 0) {
    return (
      <GlassCard className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          No events defined in ABI.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Event
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Parameters
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, i) => (
              <tr
                key={`${event.name}-${i}`}
                className="border-b border-border/30 last:border-0 hover:bg-white/5 transition-colors"
              >
                {/* Event name */}
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {event.name}
                  </span>
                </td>

                {/* Parameter types */}
                <td className="px-4 py-3">
                  {event.inputs.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {event.inputs.map((param, j) => (
                        <Badge
                          key={j}
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          {param.name ? `${param.name}: ${param.type}` : param.type}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
