/**
 * GET /me/playlists
 * Scope: playlist-read-private, playlist-read-collaborative
 *
 * Returns the authenticated user's playlists.
 * Breaking change Feb 2026: playlist.tracks renamed to playlist.items
 */

import { fetchWithAuth } from '../services/spotify-client';
import type { UserPlaylistsResponse } from '../types/spotify';

interface PlaylistsParams {
  limit?: number;  // 1–50, default 20
  offset?: number; // default 0
}

export async function getPlaylists(params: PlaylistsParams = {}): Promise<UserPlaylistsResponse> {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, number][];
  const query = entries.length
    ? '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
    : '';
  return fetchWithAuth<UserPlaylistsResponse>(`/me/playlists${query}`);
}
