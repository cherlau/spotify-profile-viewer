import { useQuery } from '@tanstack/react-query';
import { getRecentlyPlayed } from '../api/recentlyPlayed';
import { queryKeys } from '../api/queryKeys';

export function useRecentlyPlayed(limit = 50) {
  return useQuery({
    queryKey: queryKeys.recentlyPlayed(limit),
    queryFn: () => getRecentlyPlayed({ limit }),
  });
}
