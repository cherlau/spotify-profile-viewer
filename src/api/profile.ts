/**
 * GET /me
 * Scope: user-read-private
 *
 * Returns the authenticated user's profile.
 * Note: country, email, explicit_content, followers, product were removed Feb 2026.
 */

import { fetchWithAuth } from '../services/spotify-client';
import type { SpotifyUserProfile } from '../types/spotify';

export async function getProfile(): Promise<SpotifyUserProfile> {
  return fetchWithAuth<SpotifyUserProfile>('/me');
}
