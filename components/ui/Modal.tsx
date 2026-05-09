"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg-elev)] p-6",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className,
          )}
        >
          <div className="mb-4">
            <Dialog.Title className="text-[18px] font-semibold text-[var(--ink)] tracking-[-0.01em]">
              {title}
            </Dialog.Title>
            {description && (
              <Dialog.Description className="mt-1.5 text-[14px] text-[var(--ink-3)] leading-[1.5]">
                {description}
              </Dialog.Description>
            )}
          </div>
          {children}
          <Dialog.Close
            className="absolute right-4 top-4 p-1.5 rounded-[6px] text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--bg-mute)] transition-colors duration-[120ms]"
            aria-label="Close dialog"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 3l10 10M13 3 3 13" />
            </svg>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
