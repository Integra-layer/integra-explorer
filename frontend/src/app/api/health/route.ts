import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://testnet.explorer.integralayer.com";

type HealthStatus = "ok" | "degraded" | "down";
type BackendStatus = "ok" | "unreachable";

async function checkBackend(): Promise<BackendStatus> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/blocks?page=1&itemsPerPage=1`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    return res.ok ? "ok" : "unreachable";
  } catch {
    return "unreachable";
  }
}

function deriveStatus(backend: BackendStatus): HealthStatus {
  if (backend === "ok") return "ok";
  return "degraded";
}

export async function GET() {
  const backend = await checkBackend();
  const status: HealthStatus = deriveStatus(backend);

  const body = {
    status,
    uptime: process.uptime(),
    network: process.env.NEXT_PUBLIC_NETWORK_MODE ?? null,
    backend,
    timestamp: new Date().toISOString(),
  };

  // Return 503 when the explorer is fully down, 200 for ok/degraded.
  const httpStatus: 200 | 503 = status === "down" ? 503 : 200;

  return NextResponse.json(body, { status: httpStatus });
}
