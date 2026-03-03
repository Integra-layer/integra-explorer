import Link from "next/link";
import { redirect } from "next/navigation";

export default function NotFound() {
  async function handleSearch(formData: FormData) {
    "use server";
    const query = (formData.get("q") as string)?.trim();
    if (!query) return;

    // Route by input type: 64-char hex = tx hash, 40-char hex = address,
    // pure digits = block height, otherwise validators list
    if (/^[0-9A-Fa-f]{64}$/.test(query)) {
      redirect(`/transactions/${query}`);
    } else if (/^(integra1|0x)[0-9A-Za-z]{38,}$/.test(query)) {
      redirect(`/address/${query}`);
    } else if (/^\d+$/.test(query)) {
      redirect(`/blocks/${query}`);
    } else {
      redirect(`/validators`);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 text-center">
      {/* Branded accent line */}
      <div className="mb-8 h-1 w-24 rounded-full bg-gradient-to-r from-integra-brand to-integra-pink" />

      <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">
        Page not found
      </h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        The block, transaction, address, or page you are looking for does not
        exist or may have moved.
      </p>

      {/* Quick search */}
      <form action={handleSearch} className="mb-8 w-full max-w-md">
        <div className="flex gap-2">
          <input
            name="q"
            type="text"
            placeholder="Search by block, tx hash, or address…"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-integra-brand/50"
          />
          <button
            type="submit"
            className="rounded-lg bg-integra-brand px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </div>
      </form>

      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Back to explorer
      </Link>
    </div>
  );
}
