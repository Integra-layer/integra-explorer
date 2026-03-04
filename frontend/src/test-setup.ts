import "@testing-library/jest-dom/vitest";

// cmdk (used by CommandDialog) uses ResizeObserver internally.
// jsdom does not include it, so we provide a no-op stub.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// cmdk calls scrollIntoView on list items; jsdom does not implement it.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {};
}

// Radix UI Dialog / Popper use PointerEvent; jsdom does not include it.
if (typeof globalThis.PointerEvent === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type: string, params?: PointerEventInit) {
      super(type, params);
    }
  };
}
