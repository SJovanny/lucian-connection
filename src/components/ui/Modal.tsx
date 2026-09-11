"use client";

import { Fragment, ReactNode, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Only the most recently opened dialog handles keyboard and focus events.
const openDialogs: HTMLElement[] = [];
let previousBodyOverflow = "";

function getFocusableElements(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(
    'a[href], area[href], button, input, select, textarea, [tabindex], [contenteditable="true"], audio[controls], video[controls], summary'
  )).filter((element) => element.tabIndex >= 0 && !element.matches(':disabled, input[type="hidden"]') &&
    !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
    getComputedStyle(element).visibility !== "hidden" &&
    !Array.from(elementAncestors(element, dialog)).some((ancestor) => getComputedStyle(ancestor).display === "none"));
}

function* elementAncestors(element: HTMLElement, dialog: HTMLElement) {
  let current: HTMLElement | null = element;
  while (current) {
    yield current;
    if (current === dialog) break;
    current = current.parentElement;
  }
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (openDialogs.length === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openDialogs.push(dialog);
    const isTopDialog = () => openDialogs[openDialogs.length - 1] === dialog;
    const focusFirst = () => (getFocusableElements(dialog)[0] ?? dialog).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopDialog()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
      } else if (event.key === "Tab") {
        const focusable = getFocusableElements(dialog);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (!first) {
          event.preventDefault();
          dialog.focus();
        } else if (!dialog.contains(active) || active === dialog ||
          (event.shiftKey ? active === first : active === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        }
      }
    };
    const handleFocusIn = (event: FocusEvent) => {
      if (isTopDialog() && !dialog.contains(event.target as Node)) focusFirst();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    if (!dialog.contains(document.activeElement)) focusFirst();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      const wasTopDialog = isTopDialog();
      openDialogs.splice(openDialogs.indexOf(dialog), 1);
      if (openDialogs.length === 0) document.body.style.overflow = previousBodyOverflow;
      if (wasTopDialog && previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : "Modal"}
          tabIndex={-1}
          className={cn(
            "flex max-h-[calc(100dvh-2rem)] w-full flex-col rounded-2xl bg-white shadow-xl",
            sizes[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 id={titleId} className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="min-h-0 overflow-y-auto px-6 py-4">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}

// Confirmation modal helper
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "primary",
}: ConfirmModalProps) {
  const buttonVariants = {
    danger: "bg-error-500 hover:bg-error-600 text-white",
    warning: "bg-warning-500 hover:bg-warning-600 text-white",
    primary: "bg-primary-500 hover:bg-primary-600 text-white",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={cn("px-4 py-2 rounded-lg transition-colors", buttonVariants[variant])}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
