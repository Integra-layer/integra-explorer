"use client";

import Pusher from "pusher-js";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Store Pusher instance on globalThis to survive HMR in development
const globalPusher = globalThis as unknown as {
  __pusherInstance?: Pusher | null;
};
let pusherInstance: Pusher | null = globalPusher.__pusherInstance ?? null;

// Ethernal workspace DB id (single-workspace explorer)
const WORKSPACE_ID = "1";

export function getPusher(): Pusher | null {
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const host = process.env.NEXT_PUBLIC_PUSHER_HOST;
  const port = Number(process.env.NEXT_PUBLIC_PUSHER_PORT) || 443;

  if (!key) return null;

  if (!pusherInstance) {
    pusherInstance = new Pusher(key, {
      wsHost: host || window.location.hostname,
      wssPort: port,
      wsPort: port,
      forceTLS: port === 443,
      disableStats: true,
      enabledTransports: ["ws", "wss"],
      cluster: "mt1",
      channelAuthorization: {
        endpoint: "/pusher-auth",
        transport: "ajax",
      },
    });
    globalPusher.__pusherInstance = pusherInstance;
  }

  return pusherInstance;
}

export function usePusherInvalidation() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const pusher = getPusher();
    if (!pusher) return;

    // Subscribe to the Ethernal backend's private channels
    const blocksChannel = pusher.subscribe(
      `private-blocks;workspace=${WORKSPACE_ID}`,
    );
    const txChannel = pusher.subscribe(
      `private-transactions;workspace=${WORKSPACE_ID}`,
    );
    const contractsChannel = pusher.subscribe(
      `private-contracts;workspace=${WORKSPACE_ID}`,
    );

    blocksChannel.bind("new", () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
      queryClient.invalidateQueries({ queryKey: ["block"] });
      queryClient.invalidateQueries({ queryKey: ["block-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    });

    txChannel.bind("new", () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    });

    contractsChannel.bind("new", () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    });

    return () => {
      blocksChannel.unbind_all();
      txChannel.unbind_all();
      contractsChannel.unbind_all();
      pusher.unsubscribe(`private-blocks;workspace=${WORKSPACE_ID}`);
      pusher.unsubscribe(`private-transactions;workspace=${WORKSPACE_ID}`);
      pusher.unsubscribe(`private-contracts;workspace=${WORKSPACE_ID}`);
    };
  }, [queryClient]);
}
