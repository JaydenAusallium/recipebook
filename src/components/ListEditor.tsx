"use client";

import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  ordered?: boolean;
  addLabel: string;
};

export default function ListEditor({
  label,
  items,
  onChange,
  placeholder,
  ordered,
  addLabel,
}: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingFocus = useRef<number | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  useLayoutEffect(() => {
    if (pendingFocus.current !== null) {
      inputRefs.current[pendingFocus.current]?.focus();
      pendingFocus.current = null;
    }
  }, [items]);

  function update(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function addRow(focusIndex?: number) {
    const next = [...items, ""];
    pendingFocus.current = focusIndex ?? next.length - 1;
    onChange(next);
  }

  function removeRow(index: number) {
    const next = items.filter((_, i) => i !== index);
    pendingFocus.current = Math.max(0, index - 1);
    onChange(next.length ? next : [""]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      addRow(index + 1);
    } else if (e.key === "Backspace" && items[index] === "" && items.length > 1) {
      e.preventDefault();
      removeRow(index);
    }
  }

  function addBulkLines() {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setBulkOpen(false);
      return;
    }
    const existing = items.filter((i) => i.trim() !== "");
    onChange([...existing, ...lines]);
    setBulkText("");
    setBulkOpen(false);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          onClick={() => setBulkOpen((v) => !v)}
          className="text-xs font-medium text-brand underline"
        >
          {bulkOpen ? "Cancel paste" : "Paste multiple lines"}
        </button>
      </div>

      {bulkOpen && (
        <div className="mb-3 rounded-lg border border-border bg-card p-2.5">
          <textarea
            autoFocus
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={`Paste one ${label.toLowerCase().replace(/s$/, "")} per line`}
            rows={5}
            className="w-full resize-y rounded-md border border-border bg-background px-2.5 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="button"
            onClick={addBulkLines}
            className="mt-2 rounded-full bg-brand px-3.5 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Add lines
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {ordered ? (
              <span className="w-6 shrink-0 text-right text-sm text-muted">
                {index + 1}.
              </span>
            ) : (
              <span className="w-2 shrink-0 text-center text-muted">•</span>
            )}
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={item}
              onChange={(e) => update(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              aria-label="Remove"
              className="shrink-0 rounded-full p-1.5 text-muted hover:bg-black/5 hover:text-red-600 dark:hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addRow()}
        className="mt-2 rounded-full border border-dashed border-border px-3.5 py-1.5 text-sm font-medium text-muted hover:border-brand hover:text-brand"
      >
        + {addLabel}
      </button>
    </div>
  );
}
