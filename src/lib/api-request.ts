import { NextResponse } from "next/server";
import type { ZodType } from "zod";

const DEFAULT_MAX_BODY_BYTES = 64 * 1024;

export class ApiRequestError extends Error {
  constructor(
    public readonly code: "INVALID_JSON" | "INVALID_REQUEST" | "PAYLOAD_TOO_LARGE",
    public readonly status: 400 | 413
  ) {
    super(code);
    this.name = "ApiRequestError";
  }
}

export async function readBoundedBody(
  request: Request,
  maxBytes = DEFAULT_MAX_BODY_BYTES
): Promise<Uint8Array> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declaredBytes = Number(contentLength);
    if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) {
      throw new ApiRequestError("PAYLOAD_TOO_LARGE", 413);
    }
  }

  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        // A cloned request may never finish cancellation until its sibling is read.
        void reader.cancel().catch(() => undefined);
        throw new ApiRequestError("PAYLOAD_TOO_LARGE", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function readBoundedJson<T>(
  request: Request,
  schema: ZodType<T>,
  maxBytes = DEFAULT_MAX_BODY_BYTES
): Promise<T> {
  const rawBody = await readBoundedBody(request, maxBytes);
  let input: unknown;

  try {
    input = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(rawBody));
  } catch {
    throw new ApiRequestError("INVALID_JSON", 400);
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new ApiRequestError("INVALID_REQUEST", 400);
  return parsed.data;
}

export function apiRequestErrorResponse(error: unknown): NextResponse | null {
  if (!(error instanceof ApiRequestError)) return null;
  return NextResponse.json({ error: error.code }, { status: error.status });
}

export function safeLogError(context: string, error: unknown): void {
  const details: Record<string, string | number> = {};
  if (error instanceof Error) details.name = error.name;
  if (typeof error === "object" && error !== null) {
    const candidate = error as { code?: unknown; status?: unknown; statusCode?: unknown };
    if (typeof candidate.code === "string") details.code = candidate.code;
    if (typeof candidate.status === "number") details.status = candidate.status;
    if (typeof candidate.statusCode === "number") details.statusCode = candidate.statusCode;
  }
  console.error(context, details);
}
