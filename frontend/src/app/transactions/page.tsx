import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTransactions } from "@/lib/api/transactions";
import TransactionsClient from "./_client";

export default async function TransactionsPage() {
  const queryClient = new QueryClient();
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ["transactions", 1, 25],
      queryFn: () => getTransactions({ page: 1, itemsPerPage: 25 }),
    }),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionsClient />
    </HydrationBoundary>
  );
}
