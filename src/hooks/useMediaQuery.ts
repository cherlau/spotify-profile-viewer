import { useState, useEffect } from 'react';

/**
 * Retorna true enquanto a media query for satisfeita.
 * Re-renderiza o componente toda vez que o match muda.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    mql.addEventListener('change', onChange);
    setMatches(mql.matches);

    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Atalho: true quando viewport >= 768px (desktop) */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)');
}
