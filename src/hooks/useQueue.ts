import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { getQueue } from '../api/player';
import { queryKeys } from '../api/queryKeys';
import type { SpotifyQueueResponse } from '../types/spotify';
import { SpotifyApiError } from '../services/spotify-client';

interface CustomUseQueueOptions extends Omit<UseQueryOptions<SpotifyQueueResponse | null, Error>, 'queryKey' | 'queryFn'> {
  refetchInterval?: number | false;
}

export function useQueue(options: CustomUseQueueOptions = {}) {
  return useQuery({
    queryKey: queryKeys.queue,
    queryFn: async () => {
      try {
        return await getQueue();
      } catch (err) {
        // 403 = Premium required — retorna null ao invés de propagar o erro
        if (err instanceof SpotifyApiError && err.status === 403) return null;
        throw err;
      }
    },
    retry: (failureCount, err) => {
      // Não retentar 403 (Premium required) nem 404
      if (err instanceof SpotifyApiError && (err.status === 403 || err.status === 404)) return false;
      return failureCount < 1;
    },
    ...options,
  });
}
