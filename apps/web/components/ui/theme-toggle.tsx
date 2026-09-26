'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-7 w-20 rounded-full bg-surface-raised/50 border border-border-subtle" />
    );
  }

  return (
    <div
      className="flex items-center rounded-full border border-border-subtle bg-surface-raised/60 p-0.5"
      role="group"
      aria-label="Theme selector"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-label="Light mode"
        className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
          theme === 'light'
            ? 'bg-surface text-text-primary shadow-xs font-semibold'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        title="Light theme"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-label="Dark mode"
        className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
          theme === 'dark'
            ? 'bg-surface text-text-primary shadow-xs font-semibold'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        title="Dark theme"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        aria-label="System theme"
        className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
          theme === 'system'
            ? 'bg-surface text-text-primary shadow-xs font-semibold'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        title="System default"
      >
        <Laptop className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
