/**
 * GET /me/top/{type}
 * Scope: user-top-read
 *
 * Returns the user's top artists or top tracks.
 * Removed Feb 2026: Artist.followers, Artist.popularity, Track.popularity,
 *                   Track.available_markets, Track.linked_from
 */

import { fetchWithAuth } from '../services/spotify-client';
import type {
  TimeRange,
  TopArtistsResponse,
  TopTracksResponse,
} from '../types/spotify';

interface TopParams {
  time_range?: TimeRange;
  limit?: number;   // 1–50, default 20
  offset?: number;  // default 0
}

export async function getTopArtists(params: TopParams = {}): Promise<TopArtistsResponse> {
  const query = buildQuery(params);
  return fetchWithAuth<TopArtistsResponse>(`/me/top/artists${query}`);
}

export async function getTopTracks(params: TopParams = {}): Promise<TopTracksResponse> {
  const query = buildQuery(params);
  return fetchWithAuth<TopTracksResponse>(`/me/top/tracks${query}`);
}

function buildQuery(params: TopParams): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string | number][];
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}
