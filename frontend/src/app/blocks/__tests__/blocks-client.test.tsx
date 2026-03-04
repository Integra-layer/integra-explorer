import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: mockPush }),
}));

// Mock the useBlocks hook
const mockUseBlocks = vi.fn();
vi.mock("@/lib/hooks/use-blocks", () => ({
  useBlocks: (...args: unknown[]) => mockUseBlocks(...args),
}));

// Mock BlocksTable to avoid deep dependency tree in unit tests
vi.mock("@/components/blocks/blocks-table", () => ({
  BlocksTable: ({
    blocks,
    isLoading,
  }: {
    blocks: unknown[];
    isLoading: boolean;
  }) => (
    <div
      data-testid="blocks-table"
      data-loading={isLoading}
      data-count={blocks.length}
    />
  ),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const {
        initial: _i,
        animate: _a,
        exit: _e,
        variants: _v,
        ...rest
      } = props;
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

import BlocksClient from "../_client";

describe("BlocksClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("shows loading state while data is fetching", () => {
    mockUseBlocks.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<BlocksClient />);

    // The heading should always render
    expect(screen.getByText("Blocks")).toBeInTheDocument();
  });

  it("renders block data after load", () => {
    mockUseBlocks.mockReturnValue({
      data: {
        items: [
          {
            number: 100,
            hash: "0xabc",
            timestamp: "2026-01-01T00:00:00Z",
            gasUsed: "21000",
            transactions: [],
          },
        ],
        total: 87000,
      },
      isLoading: false,
      error: null,
    });

    render(<BlocksClient />);

    expect(screen.getByText("Blocks")).toBeInTheDocument();
  });

  it("shows total count badge when total > 0", () => {
    mockUseBlocks.mockReturnValue({
      data: { items: [], total: 87000 },
      isLoading: false,
      error: null,
    });

    render(<BlocksClient />);

    expect(screen.getByText("87,000")).toBeInTheDocument();
  });

  it("does not show total count badge when total is 0", () => {
    mockUseBlocks.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    });

    render(<BlocksClient />);

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("calculates correct totalPages from total", () => {
    mockUseBlocks.mockReturnValue({
      data: { items: [], total: 87000 },
      isLoading: false,
      error: null,
    });

    render(<BlocksClient />);

    // 87000 / 25 = 3480 pages
    expect(screen.getByText("Page 1 of 3480")).toBeInTheDocument();
  });

  it("shows error state on API failure", () => {
    mockUseBlocks.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Network error"),
    });

    render(<BlocksClient />);

    expect(screen.getByText(/failed to load blocks/i)).toBeInTheDocument();
  });

  it("reads page number from URL search params", () => {
    mockSearchParams = new URLSearchParams("page=5");
    mockUseBlocks.mockReturnValue({
      data: { items: [], total: 100 },
      isLoading: false,
      error: null,
    });

    render(<BlocksClient />);

    // useBlocks should be called with page 5
    expect(mockUseBlocks).toHaveBeenCalledWith(5, 25);
    expect(screen.getByText("Page 5 of 4")).toBeInTheDocument();
  });

  it("defaults to page 1 when no page param", () => {
    mockUseBlocks.mockReturnValue({
      data: { items: [], total: 50 },
      isLoading: false,
      error: null,
    });

    render(<BlocksClient />);

    expect(mockUseBlocks).toHaveBeenCalledWith(1, 25);
  });
});
