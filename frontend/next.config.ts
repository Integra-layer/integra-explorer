import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://*.integralayer.com https://api.web3modal.org https://*.walletconnect.com",
      "connect-src 'self' https://*.integralayer.com wss://*.integralayer.com https://api.web3modal.org https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com wss://*.walletconnect.com wss://*.walletconnect.org wss://*.reown.com",
      "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  // turbopack.root must be set to ".." because the frontend/ directory is nested
  // inside the monorepo root. Without this, Turbopack fails to resolve modules
  // that reference paths relative to the monorepo root (e.g. shared configs).
  // Removing this will cause build failures when using `next dev --turbopack`.
  turbopack: {
    root: "..",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "integra",
  project: "explorer",
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
});
