import { useQuery } from '@tanstack/react-query';
import { getTopArtists } from '../api/top';
import { queryKeys } from '../api/queryKeys';

export function useTopArtists(limit = 10) {
  return useQuery({
    queryKey: queryKeys.topArtists(limit),
    queryFn: () => getTopArtists({ limit }),
  });
}
