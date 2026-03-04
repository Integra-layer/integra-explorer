import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getValidators, getStakingPool } from "@/lib/api/validators";
import ValidatorsClient from "./_client";

export default async function ValidatorsPage() {
  const queryClient = new QueryClient();
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ["validators"],
      queryFn: getValidators,
    }),
    queryClient.prefetchQuery({
      queryKey: ["staking-pool"],
      queryFn: getStakingPool,
    }),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ValidatorsClient />
    </HydrationBoundary>
  );
}
