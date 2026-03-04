import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandPalette } from "../command-palette";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// next/navigation — useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// framer-motion — pass-through so animations don't break tests
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get: (_target, prop: string) => {
        const Tag = prop as keyof JSX.IntrinsicElements;
        // Return a simple wrapper component
        return ({ children, ...rest }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          React.createElement(Tag as any, rest, children);
      },
    }),
  };
});

import React from "react";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CommandPalette", () => {
  beforeEach(() => {
    mockPush.mockClear();
    localStorage.clear();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it("renders without crashing", () => {
    expect(() => render(<CommandPalette />)).not.toThrow();
  });

  it("does not show the dialog by default (uncontrolled, closed)", () => {
    render(<CommandPalette />);
    // CommandDialog is not visible when closed — the input should not be in the DOM
    expect(screen.queryByPlaceholderText(/search blocks/i)).toBeNull();
  });

  it("shows the dialog when open=true", () => {
    render(<CommandPalette open={true} />);
    expect(screen.getByPlaceholderText(/search blocks/i)).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Quick navigation links shown when open and no query
  // -------------------------------------------------------------------------

  it("shows quick navigation links when open with no query", () => {
    render(<CommandPalette open={true} />);
    expect(screen.getByText("Blocks")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Validators")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Keyboard shortcut — Cmd+K / Ctrl+K toggles open (uncontrolled)
  // -------------------------------------------------------------------------

  it("opens when Ctrl+K is pressed in uncontrolled mode", () => {
    render(<CommandPalette />);

    // Initially closed
    expect(screen.queryByPlaceholderText(/search blocks/i)).toBeNull();

    // Fire Ctrl+K
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(screen.getByPlaceholderText(/search blocks/i)).toBeInTheDocument();
  });

  it("closes when Ctrl+K is pressed again (toggle)", () => {
    render(<CommandPalette />);

    // Open
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.getByPlaceholderText(/search blocks/i)).toBeInTheDocument();

    // Close
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.queryByPlaceholderText(/search blocks/i)).toBeNull();
  });

  // -------------------------------------------------------------------------
  // onOpenChange callback
  // -------------------------------------------------------------------------

  it("calls onOpenChange(true) when Ctrl+K is pressed and currently closed", () => {
    const onOpenChange = vi.fn();
    render(<CommandPalette open={false} onOpenChange={onOpenChange} />);

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("calls onOpenChange(false) when Ctrl+K is pressed and currently open", () => {
    const onOpenChange = vi.fn();
    render(<CommandPalette open={true} onOpenChange={onOpenChange} />);

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
