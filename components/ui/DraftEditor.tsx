"use client";

import { useState } from "react";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface DraftEditorProps {
  draft: string | null | undefined;
  edited: string | null | undefined;
  onSave: (value: string) => Promise<void>;
  onReset: () => Promise<void>;
  placeholder?: string;
  label?: string;
  rows?: number;
}

export function DraftEditor({
  draft,
  edited,
  onSave,
  onReset,
  placeholder = "No content yet.",
  label,
  rows = 8,
}: DraftEditorProps) {
  const displayValue = edited ?? draft ?? "";
  const [value, setValue] = useState(displayValue);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const isDirty = value !== displayValue;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(value);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      await onReset();
      setValue(draft ?? "");
      setShowResetConfirm(false);
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>}
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {edited && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:rounded-sm"
            >
              Reset to AI draft
            </button>
          )}
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          loading={saving}
          disabled={!isDirty}
        >
          Save
        </Button>
      </div>

      <Modal
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Reset to AI draft?"
        description="This will discard your edits and restore the original AI-generated content."
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReset} loading={resetting}>
            Reset
          </Button>
        </div>
      </Modal>
    </div>
  );
}
