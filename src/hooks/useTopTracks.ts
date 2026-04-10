import { useQuery } from '@tanstack/react-query';
import { getTopTracks } from '../api/top';
import { queryKeys } from '../api/queryKeys';

export function useTopTracks(limit = 10) {
  return useQuery({
    queryKey: queryKeys.topTracks(limit),
    queryFn: () => getTopTracks({ limit }),
  });
}
