import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Pusher private channel auth endpoint.
 *
 * The Ethernal backend broadcasts to private-prefixed channels
 * (e.g. "private-blocks;workspace=1") which require server-side
 * auth per the Pusher protocol. Since this is a public explorer,
 * every subscription is authorised — we just sign the request
 * with the Soketi app secret.
 */
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const socketId = formData.get("socket_id") as string | null;
  const channelName = formData.get("channel_name") as string | null;

  if (!socketId || !channelName) {
    return NextResponse.json(
      { error: "Missing socket_id or channel_name" },
      { status: 400 },
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
