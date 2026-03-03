import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://testnet.explorer.integralayer.com";

/**
 * Static sitemap for crawlable pages.
 * Dynamic detail pages (/blocks/[height], /transactions/[hash], /address/[address],
 * /validators/[address], /contracts/[address], /tokens/[address], /passport/[id])
 * are discovered via internal links and crawling — they cannot be enumerated at
 * build time due to the continuously growing dataset.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blocks`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/transactions`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/validators`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tokens`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contracts`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/passport`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faucet`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/developers`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/resources`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
  ];
}
