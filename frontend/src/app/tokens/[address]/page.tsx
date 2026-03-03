import type { Metadata } from "next";
import TokenPageClient from "./_client";

interface TokenPageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: TokenPageProps): Promise<Metadata> {
  const { address } = await params;
  const truncated = address.length > 16 ? `${address.slice(0, 10)}...${address.slice(-6)}` : address;
  return {
    title: `Token ${truncated}`,
    description: `Token details and holders for ${address} on Integra Layer.`,
  };
}

export default function TokenPage({ params }: TokenPageProps) {
  return <TokenPageClient params={params} />;
}
