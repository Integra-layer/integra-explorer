import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getBlocks } from "@/lib/api/blocks";
import BlocksClient from "./_client";

export default async function BlocksPage() {
  const queryClient = new QueryClient();
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ["blocks", 1, 25],
      queryFn: () => getBlocks({ page: 1, itemsPerPage: 25 }),
    }),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlocksClient />
    </HydrationBoundary>
  );
}
