import type { Metadata } from "next";
import ValidatorPageClient from "./_client";

interface ValidatorPageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: ValidatorPageProps): Promise<Metadata> {
  const { address } = await params;
  const truncated = address.length > 16 ? `${address.slice(0, 10)}...${address.slice(-6)}` : address;
  return {
    title: `Validator ${truncated}`,
    description: `Validator details, delegations, and performance for ${address} on Integra Layer.`,
  };
}

export default function ValidatorPage({ params }: ValidatorPageProps) {
  return <ValidatorPageClient params={params} />;
}
