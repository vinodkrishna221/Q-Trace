'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4" data-testid="learn-error-shell">
      <Card className="border-danger/40 bg-zinc-900/90 max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle className="w-5 h-5" />
            <CardTitle className="text-lg">Module Loading Error</CardTitle>
          </div>
          <CardDescription className="text-xs text-ink-dim">
            An error occurred while loading this quantum learning module.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3 rounded bg-abyss border border-line text-xs font-mono text-danger">
            {error.message || 'Unknown render error in module shell.'}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reset()}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
