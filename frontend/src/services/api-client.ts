import { env } from "@/config/env";
import type { ApiErrorBodyDto } from "@/types/api";

const DEFAULT_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeoutMs?: number;
}

function messageFromBody(body: ApiErrorBodyDto | null, status: number): string {
  if (status >= 500)
    return "Something went wrong on our end. Please try again shortly.";
  const detail = body?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0)
    return detail.map((d) => d.msg).join("; ");
  return "Something went wrong. Please try again.";
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
    headers,
    ...init
  } = options;
  const timeout = AbortSignal.timeout(timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(
      timeout.aborted
        ? "This is taking longer than usual. Please try again."
        : "We're having trouble connecting right now. Please try again in a moment.",
      0,
    );
  }

  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => null)) as ApiErrorBodyDto | null;
    throw new ApiError(
      messageFromBody(errorBody, response.status),
      response.status,
      errorBody,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
