import { Suspense } from "react";
import { SearchClient } from "./_client";

/**
 * Search results page — server component wrapper.
 * Reads `?q=` from searchParams and passes it to the client component.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";

  return (
    <Suspense>
      <SearchClient query={query} />
    </Suspense>
  );
}
