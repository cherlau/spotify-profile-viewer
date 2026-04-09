/**
 * GET /me/following
 * Scope: user-follow-read
 *
 * Returns artists followed by the authenticated user.
 * Uses cursor-based pagination (after = last artist ID of previous page).
 * Removed Feb 2026: Artist.followers, Artist.popularity
 */

import { fetchWithAuth } from '../services/spotify-client';
import type { FollowedArtistsResponse } from '../types/spotify';

interface FollowingParams {
  limit?: number; // default 20, max 50
  after?: string; // cursor: ID of the last artist from the previous page
}

export async function getFollowedArtists(
  params: FollowingParams = {},
): Promise<FollowedArtistsResponse> {
  const query = new URLSearchParams({ type: 'artist' });
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.after !== undefined) query.set('after', params.after);
  return fetchWithAuth<FollowedArtistsResponse>(`/me/following?${query}`);
}
