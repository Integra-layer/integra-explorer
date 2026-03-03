import type { Metadata } from "next";
import BlockPageClient from "./_client";

interface BlockPageProps {
  params: Promise<{ height: string }>;
}

export async function generateMetadata({ params }: BlockPageProps): Promise<Metadata> {
  const { height } = await params;
  return {
    title: `Block #${height}`,
    description: `Details for block #${height} on the Integra Layer blockchain.`,
  };
}

export default function BlockPage({ params }: BlockPageProps) {
  return <BlockPageClient params={params} />;
}
