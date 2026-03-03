"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PageTransition } from "@/components/effects";
import { BlocksTable } from "@/components/blocks/blocks-table";
import { useBlocks } from "@/lib/hooks/use-blocks";

const ITEMS_PER_PAGE = 25;

function BlocksPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading } = useBlocks(page, ITEMS_PER_PAGE);
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/blocks?${params.toString()}`);
  }

  return (
    <PageTransition>
      <section className="container mx-auto space-y-6 px-4 py-8">
        {/* Page heading */}
        <div className="flex items-center gap-3">
          <Box className="size-6 text-integra-brand" />
          <h1 className="text-2xl font-bold tracking-tight">Blocks</h1>
          {total > 0 && (
            <Badge variant="secondary" className="font-mono">
              {total.toLocaleString()}
            </Badge>
          )}
        </div>

        {/* Table */}
        <BlocksTable blocks={data?.items ?? []} isLoading={isLoading} />

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

export default function BlocksPage() {
  return (
    <Suspense>
      <BlocksPageContent />
    </Suspense>
  );
}
