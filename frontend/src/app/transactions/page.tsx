"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PageTransition } from "@/components/effects";
import { TxTable } from "@/components/transactions/tx-table";
import { useTransactions } from "@/lib/hooks/use-transactions";

const ITEMS_PER_PAGE = 25;

function TransactionsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading } = useTransactions(page, ITEMS_PER_PAGE);
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/transactions?${params.toString()}`);
  }

  return (
    <PageTransition>
      <section className="container mx-auto space-y-6 px-4 py-8">
        {/* Page heading */}
        <div className="flex items-center gap-3">
          <ArrowRightLeft className="size-6 text-integra-brand" />
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          {total > 0 && (
            <Badge variant="secondary" className="font-mono">
              {total.toLocaleString()}
            </Badge>
          )}
        </div>

        {/* Table */}
        <TxTable transactions={data?.items ?? []} isLoading={isLoading} />

        {/* Pagination controls */}
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </section>
    </PageTransition>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense>
      <TransactionsPageContent />
    </Suspense>
  );
}
