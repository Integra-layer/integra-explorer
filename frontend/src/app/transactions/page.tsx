"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ArrowRightLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        <TxTable transactions={data?.data ?? []} isLoading={isLoading} />

        {/* Pagination controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            <ChevronLeft className="mr-1 size-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
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
