import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getPlaybackState } from '../api/player';
import { queryKeys } from '../api/queryKeys';
import type { SpotifyPlaybackState } from '../types/spotify';
import { SpotifyApiError } from '../services/spotify-client';

/**
 * Hook to fetch the current Spotify playback state.
 * Aceita configurações opcionais como refetchInterval e enabled.
 * Trata 403 como "sem player ativo" em vez de erro — evita loop de 403 para usuários Free.
 */
export function usePlaybackState(options?: Partial<UseQueryOptions<SpotifyPlaybackState | null>>) {
  return useQuery({
    queryKey: queryKeys.player,
    queryFn: async () => {
      try {
        return await getPlaybackState();
      } catch (err) {
        // 403 = Premium required — retorna null ao invés de propagar o erro
        if (err instanceof SpotifyApiError && err.status === 403) return null;
        throw err;
      }
    },
    staleTime: 3000,
    retry: (failureCount, err) => {
      // Não retentar 403 (Premium required) nem 404 — são respostas definitivas
      if (err instanceof SpotifyApiError && (err.status === 403 || err.status === 404)) return false;
      return failureCount < 1;
    },
    ...options,
  });
}
