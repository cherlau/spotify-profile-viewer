import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getPlaybackState } from '../api/player';
import { queryKeys } from '../api/queryKeys';
import type { SpotifyPlaybackState } from '../types/spotify';

/**
 * Hook to fetch the current Spotify playback state.
 * Accepts optional query configurations like refetchInterval and enabled.
 */
export function usePlaybackState(options?: Partial<UseQueryOptions<SpotifyPlaybackState | null>>) {
  return useQuery({
    queryKey: queryKeys.player,
    queryFn: getPlaybackState,
    staleTime: 3000,
    ...options
  });
}
