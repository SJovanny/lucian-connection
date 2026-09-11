// @vitest-environment jsdom

import React, { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/Input";

afterEach(cleanup);

describe("Input accessibility", () => {
  it("generates unique, stable label associations and forwards refs", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(<><Input label="First" ref={ref} /><Input label="Second" /></>);
    const first = screen.getByRole("textbox", { name: "First" });
    const id = first.id;
    expect(id).toBeTruthy();
    expect(screen.getByLabelText("Second").id).not.toBe(id);
    expect(ref.current).toBe(first);
    await user.click(screen.getByText("First"));
    expect(first).toHaveFocus();
    rerender(<><Input label="Updated" ref={ref} /><Input label="Second" /></>);
    expect(screen.getByLabelText("Updated")).toHaveAttribute("id", id);
  });

  it("preserves explicit IDs and composes external descriptions with helper or error text", () => {
    const { rerender } = render(<><p id="external">Required field.</p><Input id="email" label="Email" aria-describedby="external" helperText="Use your work email." /></>);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "email");
    expect(input).toHaveAccessibleDescription("Required field. Use your work email.");
    rerender(<><p id="external">Required field.</p><Input id="email" label="Email" aria-describedby="external" helperText="Use your work email." error="Invalid email." aria-invalid={false} /></>);
    expect(input).toHaveAccessibleDescription("Required field. Invalid email.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText("Use your work email.")).not.toBeInTheDocument();
    rerender(<><p id="external">Required field.</p><Input id="email" label="Email" helperText="Try again." /></>);
    expect(input).toHaveAccessibleDescription("Try again.");
    expect(input).not.toHaveAttribute("aria-invalid");
    rerender(<><p id="external">Required field.</p><Input id="email" label="Email" aria-invalid="grammar" /></>);
    expect(input).toHaveAttribute("aria-invalid", "grammar");
    expect(input).not.toHaveAttribute("aria-describedby");
  });
});
