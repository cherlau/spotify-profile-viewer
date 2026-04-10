import { useQuery } from '@tanstack/react-query';
import { getFollowedArtists } from '../api/following';
import { queryKeys } from '../api/queryKeys';

export function useFollowedArtists(limit = 50) {
  return useQuery({
    queryKey: queryKeys.followedArtists(limit),
    queryFn: () => getFollowedArtists({ limit }),
  });
}
