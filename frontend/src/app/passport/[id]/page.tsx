import type { Metadata } from "next";
import PassportDetailPageClient from "./_client";

interface PassportDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PassportDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Passport #${id}`,
    description: `Asset passport #${id} on the Integra Layer blockchain.`,
  };
}

export default function PassportDetailPage({ params }: PassportDetailPageProps) {
  return <PassportDetailPageClient params={params} />;
}
