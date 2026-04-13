// MOCK SYSTEM — toggle via VITE_USE_MOCK in .env
/**
 * Spotify API HTTP client.
 *
 * fetchWithAuth:
 *   1. Quando VITE_USE_MOCK=true, intercepta a chamada e retorna dados de
 *      src/mocks/spotify-data.ts com 300ms de latência simulada.
 *   2. Attaches Authorization: Bearer {token} to every request.
 *   3. If the token is known to be expired before the call, proactively refreshes it.
 *   4. If the server returns 401, retries once with a fresh token (handles clock skew /
 *      edge-case expiry that slipped through the 30s buffer in tokenStore).
 *   5. If the retry also fails with 401, clears all tokens and throws SpotifyAuthError
 *      so the app can redirect to login.
 *   6. For status 429 surfaces Retry-After in the error so callers can respect it.
 *   7. For other non-2xx responses parses the Spotify error body and throws SpotifyApiError.
 */

import { tokenStore } from '../auth/token-store';
import { refreshAccessToken } from '../auth/spotify-auth';

export const BASE_URL = 'https://api.spotify.com/v1';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function resolveMock<T>(path: string): Promise<T> {
  await new Promise((r) => setTimeout(r, 300));

  const baseUrlPattern = new RegExp(`^${BASE_URL.replace(/\//g, '\\/')}`);
  const cleanPath = path
    .replace(baseUrlPattern, '')
    .split('?')[0];

  const {
    mockProfile,
    mockTopArtists,
    mockTopTracks,
    mockPlaylists,
    mockRecentlyPlayed,
    mockFollowedArtists,
    mockSavedAlbums,
    mockSavedShows,
    mockQueue,
  } = await import('../mocks/spotify-data');

  if (cleanPath === '/me') return mockProfile as T;
  if (cleanPath === '/me/top/artists') return mockTopArtists as T;
  if (cleanPath === '/me/top/tracks') return mockTopTracks as T;
  if (cleanPath === '/me/playlists') return mockPlaylists as T;
  if (cleanPath === '/me/player/recently-played') return mockRecentlyPlayed as T;
  if (cleanPath.startsWith('/me/following')) return mockFollowedArtists as T;
  if (cleanPath === '/me/albums') return mockSavedAlbums as T;
  if (cleanPath === '/me/shows') return mockSavedShows as T;
  if (cleanPath === '/me/player/queue') return mockQueue as T;
  
  // Mock para endpoints do Player (PUT/POST geralmente retornam 204 No Content, que aqui representamos como {})
  if (cleanPath === '/me/player/play') return {} as T;
  if (cleanPath === '/me/player/pause') return {} as T;
  if (cleanPath === '/me/player/next') return {} as T;
  if (cleanPath === '/me/player/previous') return {} as T;
  if (cleanPath === '/me/player/volume') return {} as T;

  throw new Error(`[MOCK] Nenhum mock encontrado para o path: ${cleanPath}`);
}

export class SpotifyAuthError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'SpotifyAuthError';
  }
}

export class SpotifyRateLimitError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super(`Rate limited — retry after ${retryAfter}s`);
    this.name = 'SpotifyRateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class SpotifyApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'SpotifyApiError';
    this.status = status;
  }
}

async function resolveToken(): Promise<string> {
  const token = tokenStore.getAccessToken();

  if (token && !tokenStore.isAccessTokenExpired()) {
    return token;
  }

  return refreshAccessToken();
}

async function doFetch(url: string, token: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

async function handleErrorResponse(response: Response): Promise<never> {
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') ?? '1', 10);
    throw new SpotifyRateLimitError(retryAfter);
  }

  const body = await response.json().catch(() => ({ error: { message: response.statusText } }));
  const message: string = body?.error?.message ?? `HTTP ${response.status}`;
  throw new SpotifyApiError(response.status, message);
}

export async function fetchWithAuth<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  if (USE_MOCK) {
    return resolveMock<T>(url);
  }

  let token: string;
  try {
    token = await resolveToken();
  } catch {
    throw new SpotifyAuthError('No valid token — please log in again.');
  }

  let response = await doFetch(url, token, init);

  if (response.status === 401) {
    let freshToken: string;
    try {
      freshToken = await refreshAccessToken();
    } catch {
      tokenStore.clear();
      throw new SpotifyAuthError('Session expired — please log in again.');
    }

    response = await doFetch(url, freshToken, init);

    // Second 401 → refresh token itself is invalid
    if (response.status === 401) {
      tokenStore.clear();
      throw new SpotifyAuthError('Session expired — please log in again.');
    }
  }

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  if (response.status === 204 || response.status === 202) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    console.error('Failed to parse Spotify API response as JSON:', text.substring(0, 100));
    // If it's not JSON but the status was OK, return it as is (if T allows) or empty
    return {} as T;
  }
}
