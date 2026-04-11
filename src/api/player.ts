import { fetchWithAuth } from '../services/spotify-client';
import type { SpotifyPlaybackState, SpotifyQueueResponse } from '../types/spotify';

/**
 * GET /me/player
 * Scope: user-read-playback-state
 * Returns the current playback state.
 */
export async function getPlaybackState(): Promise<SpotifyPlaybackState | null> {
  const result = await fetchWithAuth<SpotifyPlaybackState | {}>('/me/player');
  // 204 No Content results in an empty object from fetchWithAuth
  if (Object.keys(result).length === 0) {
    return null;
  }
  return result as SpotifyPlaybackState;
}

/**
 * GET /me/player/queue
 * Scope: user-read-playback-state
 * Returns the user's queue of tracks.
 */
export async function getQueue(): Promise<SpotifyQueueResponse | null> {
  const result = await fetchWithAuth<SpotifyQueueResponse | {}>('/me/player/queue');
  if (Object.keys(result).length === 0) {
    return null;
  }
  return result as SpotifyQueueResponse;
}

/**
 * PUT /me/player/play
 * Scope: user-modify-playback-state
 */
export async function play(): Promise<void> {
  await fetchWithAuth('/me/player/play', { method: 'PUT' });
}

/**
 * PUT /me/player/pause
 * Scope: user-modify-playback-state
 */
export async function pause(): Promise<void> {
  await fetchWithAuth('/me/player/pause', { method: 'PUT' });
}

/**
 * POST /me/player/next
 * Scope: user-modify-playback-state
 */
export async function next(): Promise<void> {
  await fetchWithAuth('/me/player/next', { method: 'POST' });
}

/**
 * POST /me/player/previous
 * Scope: user-modify-playback-state
 */
export async function previous(): Promise<void> {
  await fetchWithAuth('/me/player/previous', { method: 'POST' });
}

/**
 * PUT /me/player/seek
 * Scope: user-modify-playback-state
 */
export async function seek(positionMs: number): Promise<void> {
  await fetchWithAuth(`/me/player/seek?position_ms=${Math.round(positionMs)}`, { method: 'PUT' });
}
