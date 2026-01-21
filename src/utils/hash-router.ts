/**
 * Simple Hash Router for Streaming
 * 
 * URL patterns:
 * - #/ → Main app
 * - #/watch/:streamKey → Watch stream
 * 
 * No React Router needed - uses window.location.hash
 */

import { useState, useEffect } from 'react';

export interface Route {
  path: string;
  params: Record<string, string>;
}

export function useHashRouter(): Route {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route;
}

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/'; // Remove #
  
  // Match /watch/:streamKey
  const watchMatch = hash.match(/^\/watch\/(.+)$/);
  if (watchMatch) {
    return {
      path: '/watch',
      params: { streamKey: watchMatch[1] },
    };
  }

  return { path: '/', params: {} };
}

export function navigateTo(path: string): void {
  window.location.hash = path;
}

export function goBack(): void {
  window.location.hash = '/';
}
