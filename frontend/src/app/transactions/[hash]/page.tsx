"use client";

import { use } from "react";
import { PageTransition } from "@/components/effects";
import { TxDetail } from "@/components/transactions/tx-detail";
import { useTransaction } from "@/lib/hooks/use-transactions";

interface TransactionPageProps {
  params: Promise<{ hash: string }>;
}

export default function TransactionPage({ params }: TransactionPageProps) {
  const { hash } = use(params);
  const { data: transaction, isLoading, error } = useTransaction(hash);

  if (error) {
    return (
      <PageTransition>
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <h1 className="text-2xl font-bold">Transaction Not Found</h1>
            <p className="text-muted-foreground">
              Transaction {hash} could not be loaded.
            </p>
          </div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <section className="container mx-auto px-4 py-8">
        <TxDetail transaction={transaction} isLoading={isLoading} />
      </section>
    </PageTransition>
  );
}
