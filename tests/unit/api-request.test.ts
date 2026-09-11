import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ApiRequestError, readBoundedJson } from "@/lib/api-request";

const schema = z.object({ value: z.string() }).strict();

describe("readBoundedJson", () => {
  it("rejects oversized cloned requests without waiting for the unread clone", async () => {
    const request = new Request("https://example.com", {
      method: "POST", body: JSON.stringify({ value: "oversized" }),
    });
    const clone = request.clone();
    try {
      await expect(readBoundedJson(request, schema, 5)).rejects.toMatchObject({ status: 413 });
    } finally {
      await clone.text();
    }
  }, 1000);
  it("returns strictly validated JSON", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ value: "accepted" }),
    });

    await expect(readBoundedJson(request, schema)).resolves.toEqual({ value: "accepted" });
  });

  it.each([
    ["not-json", "INVALID_JSON"],
    [JSON.stringify({ value: "accepted", id: "unexpected" }), "INVALID_REQUEST"],
  ])("rejects invalid body as %s", async (body, code) => {
    const request = new Request("https://example.com", { method: "POST", body });
    await expect(readBoundedJson(request, schema)).rejects.toMatchObject({ code, status: 400 });
  });

  it("stops reading a body once it exceeds the limit", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ value: "too large" }),
    });

    await expect(readBoundedJson(request, schema, 5)).rejects.toEqual(
      new ApiRequestError("PAYLOAD_TOO_LARGE", 413)
    );
  });

  it("keeps the 413 result when stream cancellation rejects", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("1234"));
        controller.enqueue(new TextEncoder().encode("5678"));
      },
      cancel() {
        throw new Error("cancel failed");
      },
    });
    const request = new Request("https://example.com", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit);

    await expect(readBoundedJson(request, schema, 5)).rejects.toMatchObject({
      code: "PAYLOAD_TOO_LARGE",
      status: 413,
    });
  });
});
