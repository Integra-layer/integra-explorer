"use client";

import Pusher from "pusher-js";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher | null {
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const host = process.env.NEXT_PUBLIC_PUSHER_HOST;

  if (!key) return null;

  if (!pusherInstance) {
    pusherInstance = new Pusher(key, {
      wsHost: host || window.location.hostname,
      wssPort: 443,
      wsPort: 443,
      forceTLS: true,
      disableStats: true,
      enabledTransports: ["ws", "wss"],
      cluster: "mt1",
    });
  }

  return pusherInstance;
}

export function getChannelName(): string {
  const workspaceId = process.env.NEXT_PUBLIC_WORKSPACE_ID || "1";
  return `public-explorer-${workspaceId}`;
}

export function usePusherInvalidation() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const pusher = getPusher();
    if (!pusher) return;

    const channelName = getChannelName();
    const channel = pusher.subscribe(channelName);

    channel.bind("new-block", () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    });

    channel.bind("new-transaction", () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    });

    channel.bind("new-contract", () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [queryClient]);
}
