import type { Metadata } from "next";
import AddressPageClient from "./_client";

interface AddressPageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: AddressPageProps): Promise<Metadata> {
  const { address } = await params;
  const truncated = address.length > 16 ? `${address.slice(0, 10)}...${address.slice(-6)}` : address;
  return {
    title: `Address ${truncated}`,
    description: `Balance, transactions, and token holdings for address ${address} on Integra Layer.`,
  };
}

export default function AddressPage({ params }: AddressPageProps) {
  return <AddressPageClient params={params} />;
}
