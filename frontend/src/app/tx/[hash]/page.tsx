import { redirect } from "next/navigation";

interface TxRedirectProps {
  params: Promise<{ hash: string }>;
}

export default async function TxRedirect({ params }: TxRedirectProps) {
  const { hash } = await params;
  redirect(`/transactions/${hash}`);
}
