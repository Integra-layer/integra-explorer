import type { Metadata } from "next";
import TransactionPageClient from "./_client";

interface TransactionPageProps {
  params: Promise<{ hash: string }>;
}

export async function generateMetadata({ params }: TransactionPageProps): Promise<Metadata> {
  const { hash } = await params;
  const truncated = hash.length > 16 ? `${hash.slice(0, 10)}...${hash.slice(-6)}` : hash;
  return {
    title: `Transaction ${truncated}`,
    description: `Details for transaction ${hash} on the Integra Layer blockchain.`,
  };
}

export default function TransactionPage({ params }: TransactionPageProps) {
  return <TransactionPageClient params={params} />;
}
