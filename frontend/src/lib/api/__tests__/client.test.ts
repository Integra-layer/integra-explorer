import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchApi, ApiError, setWorkspaceName, setFirebaseUserId } from "../client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchOk(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  } as unknown as Response);
}

function mockFetchError(status: number, statusText: string, body?: unknown) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
    json: body !== undefined
      ? () => Promise.resolve(body)
      : () => Promise.reject(new Error("not JSON")),
  } as unknown as Response);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("fetchApi", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Ensure a known workspace + firebaseUserId so URL params are predictable
    setWorkspaceName("TestWorkspace");
    setFirebaseUserId("test-uid-123");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Success path
  // -------------------------------------------------------------------------

  it("returns parsed JSON on a 200 response", async () => {
    global.fetch = mockFetchOk({ blocks: [], total: 0 });

    const result = await fetchApi<{ blocks: unknown[]; total: number }>("/blocks");

    expect(result).toEqual({ blocks: [], total: 0 });
  });

  it("calls fetch exactly once", async () => {
    const spy = mockFetchOk({ ok: true });
    global.fetch = spy;

    await fetchApi("/some/endpoint");

    expect(spy).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // URL construction — workspace and firebaseUserId params
  // -------------------------------------------------------------------------

  it("appends workspace param to the URL", async () => {
    const spy = mockFetchOk({});
    global.fetch = spy;

    await fetchApi("/blocks");

    const calledUrl: string = spy.mock.calls[0][0] as string;
    expect(calledUrl).toContain("workspace=TestWorkspace");
  });

  it("appends firebaseUserId param to the URL", async () => {
    const spy = mockFetchOk({});
    global.fetch = spy;

    await fetchApi("/blocks");

    const calledUrl: string = spy.mock.calls[0][0] as string;
    expect(calledUrl).toContain("firebaseUserId=test-uid-123");
  });

  it("includes additional params passed directly", async () => {
    const spy = mockFetchOk({});
    global.fetch = spy;

    await fetchApi("/blocks", { page: "2", itemsPerPage: "10" });

    const calledUrl: string = spy.mock.calls[0][0] as string;
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).toContain("itemsPerPage=10");
  });

  it("does not include undefined params in the URL", async () => {
    const spy = mockFetchOk({});
    global.fetch = spy;

    await fetchApi("/blocks", { page: undefined });

    const calledUrl: string = spy.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain("page=undefined");
  });

  // -------------------------------------------------------------------------
  // Error path — ApiError
  // -------------------------------------------------------------------------

  it("throws ApiError when response is not ok", async () => {
    global.fetch = mockFetchError(404, "Not Found");

    await expect(fetchApi("/missing")).rejects.toBeInstanceOf(ApiError);
  });

  it("ApiError carries the correct status code", async () => {
    global.fetch = mockFetchError(500, "Internal Server Error");

    let caught: ApiError | null = null;
    try {
      await fetchApi("/fail");
    } catch (e) {
      caught = e as ApiError;
    }

    expect(caught?.status).toBe(500);
  });

  it("ApiError message includes the status code and endpoint", async () => {
    global.fetch = mockFetchError(403, "Forbidden");

    let caught: ApiError | null = null;
    try {
      await fetchApi("/secret");
    } catch (e) {
      caught = e as ApiError;
    }

    expect(caught?.message).toContain("403");
    expect(caught?.message).toContain("/secret");
  });

  it("ApiError attaches parsed body when response body is JSON", async () => {
    global.fetch = mockFetchError(400, "Bad Request", { error: "missing param" });

    let caught: ApiError | null = null;
    try {
      await fetchApi("/bad");
    } catch (e) {
      caught = e as ApiError;
    }

    expect(caught?.body).toEqual({ error: "missing param" });
  });

  it("ApiError.name is 'ApiError'", async () => {
    global.fetch = mockFetchError(422, "Unprocessable Entity");

    let caught: ApiError | null = null;
    try {
      await fetchApi("/validate");
    } catch (e) {
      caught = e as ApiError;
    }

    expect(caught?.name).toBe("ApiError");
  });

  // -------------------------------------------------------------------------
  // Network failure
  // -------------------------------------------------------------------------

  it("re-throws network errors (e.g., fetch rejection)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetchApi("/network-fail")).rejects.toThrow("Failed to fetch");
  });
});
