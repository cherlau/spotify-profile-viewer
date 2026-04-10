import { useQuery } from '@tanstack/react-query';
import { getSavedAlbums } from '../api/savedAlbums';
import { queryKeys } from '../api/queryKeys';

export function useSavedAlbums(limit = 50) {
  return useQuery({
    queryKey: queryKeys.savedAlbums(limit),
    queryFn: () => getSavedAlbums({ limit }),
  });
}
