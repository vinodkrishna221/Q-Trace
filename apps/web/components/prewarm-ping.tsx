'use client';

import * as React from 'react';

/**
 * PrewarmPing Component
 * Fires a lightweight background health check to the API on initial web page load.
 * This pre-warms free-tier cloud instances (e.g. Render spin-down) so users and judges
 * don't experience cold start delays when interacting with auth or simulation workflows.
 */
export function PrewarmPing() {
  React.useEffect(() => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      fetch(`${apiBase.replace(/\/$/, '')}/health`, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
      }).catch(() => {
        // Silent fire-and-forget
      });
    } catch {
      // Ignore background fetch errors
    }
  }, []);

  return null;
}
