"use client";

import { usePusherInvalidation } from "./pusher";

export function PusherProvider({ children }: { children: React.ReactNode }) {
  usePusherInvalidation();
  return <>{children}</>;
}
