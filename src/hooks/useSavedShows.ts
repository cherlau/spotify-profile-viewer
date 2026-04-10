import { useQuery } from '@tanstack/react-query';
import { getSavedShows } from '../api/savedShows';
import { queryKeys } from '../api/queryKeys';

export function useSavedShows(limit = 50) {
  return useQuery({
    queryKey: queryKeys.savedShows(limit),
    queryFn: () => getSavedShows({ limit }),
  });
}
