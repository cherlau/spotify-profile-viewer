import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { getQueue } from '../api/player';
import { queryKeys } from '../api/queryKeys';
import type { SpotifyQueueResponse } from '../types/spotify';

interface CustomUseQueueOptions extends Omit<UseQueryOptions<SpotifyQueueResponse | null, Error>, 'queryKey' | 'queryFn'> {
  refetchInterval?: number | false;
}

export function useQueue(options: CustomUseQueueOptions = {}) {
  return useQuery({
    queryKey: queryKeys.queue,
    queryFn: getQueue,
    ...options,
  });
}
