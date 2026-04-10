/**
 * GET /me/albums
 * Scope: user-library-read
 *
 * Returns albums saved in the authenticated user's library.
 */

import { fetchWithAuth } from '../services/spotify-client';
import type { SavedAlbumsResponse } from '../types/spotify';

interface SavedAlbumsParams {
  limit?: number;  // 1–50, default 20
  offset?: number; // default 0
}

export async function getSavedAlbums(
  params: SavedAlbumsParams = {},
): Promise<SavedAlbumsResponse> {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, number][];
  const query = entries.length
    ? '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
    : '';
  return fetchWithAuth<SavedAlbumsResponse>(`/me/albums${query}`);
}
