'use client';

import * as React from 'react';

export function CursorToggle() {
  const [enabled, setEnabled] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('qtrace_cursor_enabled');
    if (saved === 'false') {
      setEnabled(false);
    }
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem('qtrace_cursor_enabled', String(next));
    window.dispatchEvent(new CustomEvent('qtrace:cursor-toggle', { detail: { enabled: next } }));
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-border-subtle bg-surface hover:border-accent text-text-muted hover:text-text-primary transition-colors cursor-pointer"
      title="Toggle between custom Atomic Cursor and standard system pointer"
      aria-label="Toggle Atomic Cursor"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full transition-colors ${
          enabled ? 'bg-[var(--evidence-success,#033c00)] dark:bg-[var(--evidence-success,#7ccf73)]' : 'bg-text-faint'
        }`}
      />
      <span>Atom Cursor: {enabled ? 'ON' : 'OFF'}</span>
    </button>
  );
}
