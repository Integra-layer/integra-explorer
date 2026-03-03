import type { Metadata } from "next";
import ContractDetailPageClient from "./_client";

interface ContractPageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: ContractPageProps): Promise<Metadata> {
  const { address } = await params;
  const truncated = address.length > 16 ? `${address.slice(0, 10)}...${address.slice(-6)}` : address;
  return {
    title: `Contract ${truncated}`,
    description: `Smart contract details, ABI, and interaction for ${address} on Integra Layer.`,
  };
}

export default function ContractDetailPage({ params }: ContractPageProps) {
  return <ContractDetailPageClient params={params} />;
}
