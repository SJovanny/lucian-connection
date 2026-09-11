// @vitest-environment jsdom

import React, { StrictMode, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmModal, Modal } from "@/components/ui/Modal";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("Modal accessibility", () => {
  it("names the dialog, traps focus in both directions, and restores focus and scrolling on Escape", async () => {
    const user = userEvent.setup();
    document.body.style.overflow = "scroll";
    function Example() {
      const [open, setOpen] = useState(false);
      return <><button onClick={() => setOpen(true)}>Open</button><Modal isOpen={open} onClose={() => setOpen(false)} title="Settings"><button disabled>Disabled</button><button hidden>Hidden</button><button style={{ display: "none" }}>Invisible</button><input aria-label="Name" /><button>Save</button></Modal><button>Outside</button></>;
    }
    render(<StrictMode><Example /></StrictMode>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog", { name: "Settings" })).toHaveAttribute("aria-modal", "true");
    const close = screen.getByRole("button", { name: "Close modal" });
    expect(close).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
    screen.getByRole("button", { name: "Outside" }).focus();
    expect(close).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("focuses and traps on an untitled dialog with no focusable content", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Modal isOpen onClose={vi.fn()}><p>Information</p></Modal>);
    const dialog = screen.getByRole("dialog", { name: "Modal" });
    expect(dialog).toHaveFocus();
    await user.tab();
    expect(dialog).toHaveFocus();
    await user.tab({ shift: true });
    expect(dialog).toHaveFocus();
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("dismisses through the covering backdrop and close button, but not content clicks", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="Details"><button>Content</button></Modal>);
    await user.click(screen.getByRole("button", { name: "Content" }));
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole("dialog").parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Close modal" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("keeps focus on rerender and uses the latest close callback", async () => {
    const user = userEvent.setup();
    const original = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(<Modal isOpen onClose={original} title="Edit"><input aria-label="Value" /></Modal>);
    await user.click(screen.getByRole("textbox"));
    rerender(<Modal isOpen onClose={latest} title="Edit"><input aria-label="Value" /></Modal>);
    expect(screen.getByRole("textbox")).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(latest).toHaveBeenCalledOnce();
    expect(original).not.toHaveBeenCalled();
  });

  it("keeps scrolling locked for overlapping dialogs and only dismisses the top one", async () => {
    const user = userEvent.setup();
    const closeFirst = vi.fn();
    const closeSecond = vi.fn();
    const { rerender } = render(<><Modal isOpen onClose={closeFirst} title="First"><button>First action</button></Modal><Modal isOpen={false} onClose={closeSecond} title="Second">Second content</Modal></>);
    rerender(<><Modal isOpen onClose={closeFirst} title="First"><button>First action</button></Modal><Modal isOpen onClose={closeSecond} title="Second">Second content</Modal></>);
    expect(within(screen.getByRole("dialog", { name: "Second" })).getByRole("button")).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(closeSecond).toHaveBeenCalledOnce();
    expect(closeFirst).not.toHaveBeenCalled();
    rerender(<><Modal isOpen onClose={closeFirst} title="First"><button>First action</button></Modal><Modal isOpen={false} onClose={closeSecond} title="Second">Second content</Modal></>);
    expect(within(screen.getByRole("dialog", { name: "First" })).getByRole("button", { name: "Close modal" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("does not submit a surrounding form through confirmation controls", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<form onSubmit={onSubmit}><ConfirmModal isOpen onClose={onClose} onConfirm={onConfirm} title="Confirm" message="Proceed?" /></form>);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Annuler" }));
    await user.click(screen.getByRole("button", { name: "Close modal" }));
    expect(onClose).toHaveBeenCalledTimes(3);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
