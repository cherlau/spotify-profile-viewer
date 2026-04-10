import { useQuery } from '@tanstack/react-query';
import { getPlaylists } from '../api/playlists';
import { queryKeys } from '../api/queryKeys';

export function usePlaylists(limit = 50) {
  return useQuery({
    queryKey: queryKeys.playlists(limit),
    queryFn: () => getPlaylists({ limit }),
  });
}
