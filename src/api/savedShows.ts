/**
 * GET /me/shows
 * Scope: user-library-read
 *
 * Returns shows (podcasts) saved in the authenticated user's library.
 */

import { fetchWithAuth } from '../services/spotify-client';
import type { SavedShowsResponse } from '../types/spotify';

interface SavedShowsParams {
  limit?: number;  // 1–50, default 20
  offset?: number; // default 0
}

export async function getSavedShows(
  params: SavedShowsParams = {},
): Promise<SavedShowsResponse> {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, number][];
  const query = entries.length
    ? '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
    : '';
  return fetchWithAuth<SavedShowsResponse>(`/me/shows${query}`);
}
