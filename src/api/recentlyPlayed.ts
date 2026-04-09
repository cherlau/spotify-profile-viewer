/**
 * GET /me/player/recently-played
 * Scope: user-read-recently-played
 *
 * Returns tracks recently played by the authenticated user.
 * Use `after` OR `before` — not both.
 */

import { fetchWithAuth } from '../services/spotify-client';
import type { RecentlyPlayedResponse } from '../types/spotify';

interface RecentlyPlayedParams {
  limit?: number;  // 1–50, default 20
  after?: number;  // Unix timestamp ms — return items played after this time
  before?: number; // Unix timestamp ms — return items played before this time
}

export async function getRecentlyPlayed(
  params: RecentlyPlayedParams = {},
): Promise<RecentlyPlayedResponse> {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, number][];
  const query = entries.length
    ? '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
    : '';
  return fetchWithAuth<RecentlyPlayedResponse>(`/me/player/recently-played${query}`);
}
