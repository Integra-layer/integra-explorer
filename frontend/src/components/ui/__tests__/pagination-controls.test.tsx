import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaginationControls } from "../pagination-controls";

describe("PaginationControls", () => {
  it("renders 'Page X of Y' correctly", () => {
    render(<PaginationControls page={3} totalPages={10} onPageChange={() => {}} />);

    expect(screen.getByText("Page 3 of 10")).toBeInTheDocument();
  });

  it("disables Previous button on page 1", () => {
    render(<PaginationControls page={1} totalPages={5} onPageChange={() => {}} />);

    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it("disables Next button on last page", () => {
    render(<PaginationControls page={5} totalPages={5} onPageChange={() => {}} />);

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it("enables both buttons on a middle page", () => {
    render(<PaginationControls page={3} totalPages={5} onPageChange={() => {}} />);

    const prevButton = screen.getByRole("button", { name: /previous/i });
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(prevButton).toBeEnabled();
    expect(nextButton).toBeEnabled();
  });

  it("calls onPageChange with page - 1 when Previous is clicked", () => {
    const onPageChange = vi.fn();
    render(<PaginationControls page={3} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: /previous/i }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with page + 1 when Next is clicked", () => {
    const onPageChange = vi.fn();
    render(<PaginationControls page={3} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("shows 'Page 1 of 1' and disables both buttons for single page", () => {
    render(<PaginationControls page={1} totalPages={1} onPageChange={() => {}} />);

    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });
});
