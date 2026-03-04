import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Pusher private channel auth endpoint.
 *
 * The Ethernal backend broadcasts to private-prefixed channels
 * (e.g. "private-blocks;workspace=1") which require server-side
 * auth per the Pusher protocol. Only channels matching the
 * expected workspace pattern are authorized.
 */

const WORKSPACE_ID = process.env.ETHERNAL_WORKSPACE_ID ?? "1";

const ALLOWED_CHANNEL_RE = new RegExp(
  `^private-(blocks|transactions|contracts);workspace=${WORKSPACE_ID}$`,
);

export async function POST(req: NextRequest) {
  // Verify request originates from our own site
  const origin = req.headers.get("origin");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && origin) {
    try {
      if (origin !== new URL(siteUrl).origin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      // Invalid SITE_URL — skip origin check
    }
  }

  const formData = await req.formData();
  const socketId = formData.get("socket_id") as string | null;
  const channelName = formData.get("channel_name") as string | null;

  if (!socketId || !channelName) {
    return NextResponse.json(
      { error: "Missing socket_id or channel_name" },
      { status: 400 },
    );
  }

  // Only authorize known channels for this workspace
  if (!ALLOWED_CHANNEL_RE.test(channelName)) {
    return NextResponse.json(
      { error: "Unauthorized channel" },
      { status: 403 },
    );
  }

  const appKey = process.env.SOKETI_DEFAULT_APP_KEY ?? "";
  const appSecret = process.env.SOKETI_DEFAULT_APP_SECRET ?? "";

  if (!appKey || !appSecret) {
    return NextResponse.json(
      { error: "Pusher credentials not configured" },
      { status: 500 },
    );
  }

  const signature = createHmac("sha256", appSecret)
    .update(`${socketId}:${channelName}`)
    .digest("hex");

  return NextResponse.json({ auth: `${appKey}:${signature}` });
}
