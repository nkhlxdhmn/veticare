const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const API_PREFIX = "/api/v1";
const DEFAULT_TIMEOUT_MS = 15_000;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("veticare_token");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token ?? null;
  } catch (err) {
    console.warn("Failed to parse auth token:", err);
    return null;
  }
}

function getRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem("veticare_token");
    if (!raw) return null;
    return JSON.parse(raw)?.refresh_token ?? null;
  } catch {
    return null;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}${API_PREFIX}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json();
        localStorage.setItem("veticare_token", JSON.stringify(data));
        return true;
      })
      .catch(() => false)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const combinedSignal = options.signal
    ? anySignal([options.signal, controller.signal])
    : controller.signal;

  try {
    const res = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 401 && !path.includes("/auth/refresh")) {
        const refreshed = await tryRefresh();
        if (refreshed) {
          return request<T>(method, path, body, options);
        }
        onUnauthorized?.();
      }
      const detail = await res.json().catch(() => ({ detail: res.statusText }));
      throw new ApiError(detail.detail ?? `Request failed (${res.status})`, res.status);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }
    throw new ApiError(
      err instanceof Error ? err.message : "Network request failed",
      0,
    );
  }
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const s of signals) {
    if (s.aborted) {
      controller.abort(s.reason);
      return controller.signal;
    }
    s.addEventListener("abort", () => controller.abort(s.reason), { once: true });
  }
  return controller.signal;
}

function apiGet<T>(path: string, options?: RequestOptions) {
  return request<T>("GET", path, undefined, options);
}

function apiPost<T>(path: string, body?: unknown, options?: RequestOptions) {
  return request<T>("POST", path, body, options);
}

function apiPatch<T>(path: string, body?: unknown, options?: RequestOptions) {
  return request<T>("PATCH", path, body, options);
}

function apiDelete<T>(path: string, options?: RequestOptions) {
  return request<T>("DELETE", path, undefined, options);
}

export const api = { get: apiGet, post: apiPost, patch: apiPatch, delete: apiDelete };

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn;
}

const AI_API_BASE = import.meta.env.VITE_AI_API_URL ?? "http://localhost:8000";

async function aiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  timeout = 15_000,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${AI_API_BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const detail = await res.json().catch(() => ({ detail: res.statusText }));
      throw new ApiError(detail.detail ?? `Request failed (${res.status})`, res.status);
    }

    return res.json() as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }
    throw new ApiError(
      err instanceof Error ? err.message : "Network request failed",
      0,
    );
  }
}

function aiGet<T>(path: string) { return aiRequest<T>("GET", path); }
function aiPost<T>(path: string, body?: unknown) { return aiRequest<T>("POST", path, body); }

export const aiApi = { get: aiGet, post: aiPost };

export { ApiError };
