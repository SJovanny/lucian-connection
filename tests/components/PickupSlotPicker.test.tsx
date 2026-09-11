// @vitest-environment jsdom

import React, { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PickupSlotPicker } from "@/components/pickup/PickupSlotPicker";
import type { PickupDay } from "@/lib/pickup-rules";

const days: PickupDay[] = [
  { date: "2026-09-14", state: "available", slots: [{ time: "09:00", pickupAt: "2026-09-14T13:00:00Z" }] },
  { date: "2026-09-15", state: "available", slots: [{ time: "10:00", pickupAt: "2026-09-15T14:00:00Z" }] },
];
const response = (available: PickupDay[]) => ({ ok: true, json: async () => ({ days: available }) }) as Response;

function Harness({ reloadToken = 0, initial = null }: { reloadToken?: number; initial?: string | null }) {
  const [value, setValue] = useState(initial);
  return <>
    <output aria-label="Selected pickup">{value ?? "none"}</output>
    <PickupSlotPicker locale="en" value={value} onChange={next => setValue(next)} reloadToken={reloadToken} />
  </>;
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("preserves and toggles an equivalent Supabase timestamp against ISO availability", async () => {
  const pickupAt = "2026-09-14T13:00:00.000Z";
  const initial = "2026-09-14T13:00:00+00:00";
  const available = [{ ...days[0], slots: [{ time: "09:00", pickupAt }] }];
  const fetchMock = vi.fn().mockResolvedValue(response(available));
  vi.stubGlobal("fetch", fetchMock);
  const user = userEvent.setup();
  const { rerender } = render(<Harness initial={initial} />);
  const slot = await screen.findByRole("button", { name: "09:00" });
  expect(screen.getByLabelText("Selected pickup")).toHaveTextContent(initial);
  expect(slot).toHaveAttribute("aria-pressed", "true");
  expect(slot).toHaveClass("bg-primary-500");

  rerender(<Harness initial={initial} reloadToken={1} />);
  const refreshedSlot = await screen.findByRole("button", { name: "09:00" });
  expect(screen.getByLabelText("Selected pickup")).toHaveTextContent(initial);
  expect(refreshedSlot).toHaveAttribute("aria-pressed", "true");
  await user.click(refreshedSlot);
  expect(screen.getByLabelText("Selected pickup")).toHaveTextContent("none");
  expect(refreshedSlot).toHaveAttribute("aria-pressed", "false");
  await user.click(refreshedSlot);
  expect(screen.getByLabelText("Selected pickup")).toHaveTextContent(pickupAt);
  expect(refreshedSlot).toHaveAttribute("aria-pressed", "true");
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("clears the submitted value on a day change but keeps it on the same day", async () => {
  const fetchMock = vi.fn().mockResolvedValue(response(days));
  vi.stubGlobal("fetch", fetchMock);
  const user = userEvent.setup();
  render(<Harness />);
  await user.click(await screen.findByRole("button", { name: "09:00" }));
  await user.click(screen.getByRole("button", { name: /Mon, Sep 14/ }));
  expect(screen.getByLabelText("Selected pickup")).toHaveTextContent(days[0].slots[0].pickupAt);
  await user.click(screen.getByRole("button", { name: /Tue, Sep 15/ }));
  expect(screen.getByLabelText("Selected pickup")).toHaveTextContent("none");
  expect(screen.getByRole("button", { name: "10:00" })).toHaveAttribute("aria-pressed", "false");
  await user.click(screen.getByRole("button", { name: "10:00" }));
  expect(screen.getByLabelText("Selected pickup")).toHaveTextContent(days[1].slots[0].pickupAt);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it.each([[], [days[1]], [{ ...days[0], slots: [] }], [{ ...days[0], state: "closed" as const }]].map(available => ({ available })))("clears a selection removed from refreshed availability $available", async ({ available }) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response(days)).mockResolvedValueOnce(response(available)));
  const { rerender } = render(<Harness initial={days[0].slots[0].pickupAt} />);
  await screen.findByRole("button", { name: "09:00" });
  expect(screen.getByLabelText("Selected pickup")).toHaveTextContent(days[0].slots[0].pickupAt);
  rerender(<Harness initial={days[0].slots[0].pickupAt} reloadToken={1} />);
  await waitFor(() => expect(screen.getByLabelText("Selected pickup")).toHaveTextContent("none"));
});

it("clears an initially stale value without refetching on callback changes", async () => {
  const fetchMock = vi.fn().mockResolvedValue(response(days));
  vi.stubGlobal("fetch", fetchMock);
  render(<Harness initial="expired" />);
  await waitFor(() => expect(screen.getByLabelText("Selected pickup")).toHaveTextContent("none"));
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("ignores late responses from superseded requests and preserves a still-available selection", async () => {
  let resolveOld!: (value: Response) => void;
  const oldRequest = new Promise<Response>(resolve => { resolveOld = resolve; });
  const fetchMock = vi.fn().mockReturnValueOnce(oldRequest).mockResolvedValueOnce(response(days));
  vi.stubGlobal("fetch", fetchMock);
  const { rerender } = render(<Harness initial={days[0].slots[0].pickupAt} />);
  rerender(<Harness initial={days[0].slots[0].pickupAt} reloadToken={1} />);
  await screen.findByRole("button", { name: "09:00" });
  await act(async () => { resolveOld(response([])); await oldRequest; });
  expect(screen.getByRole("button", { name: "09:00" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByLabelText("Selected pickup")).toHaveTextContent(days[0].slots[0].pickupAt);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
