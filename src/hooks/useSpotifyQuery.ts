import { useState, useEffect, useCallback, useRef } from 'react';
import { SpotifyAuthError } from '../services/spotify-client';

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook genérico para fetching de dados da Spotify API.
 *
 * Aceita um fetcher function (retorna Promise<T>).
 * Re-executa automaticamente quando `fetcher` muda de referência
 * — use useCallback para controlar isso.
 *
 * Em caso de SpotifyAuthError, expõe o erro para que a camada de rota
 * possa redirecionar para /login.
 */
export function useSpotifyQuery<T>(
  fetcher: (() => Promise<T>) | null,
): QueryState<T> & { refetch: () => void } {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    isLoading: fetcher !== null,
    error: null,
  });

  // Ref para cancelar updates de fetches obsoletos
  const abortRef = useRef(false);

  const execute = useCallback(async () => {
    if (!fetcher) return;

    abortRef.current = false;
    setState({ data: null, isLoading: true, error: null });

    try {
      const data = await fetcher();
      if (!abortRef.current) {
        setState({ data, isLoading: false, error: null });
      }
    } catch (err) {
      if (!abortRef.current) {
        const message =
          err instanceof SpotifyAuthError
            ? 'Sessão expirada. Faça login novamente.'
            : err instanceof Error
              ? err.message
              : 'Erro desconhecido.';
        setState({ data: null, isLoading: false, error: message });
      }
    }
  }, [fetcher]);

  useEffect(() => {
    execute();
    return () => {
      abortRef.current = true;
    };
  }, [execute]);

  return { ...state, refetch: execute };
}
