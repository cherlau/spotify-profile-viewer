import { CLIENT_ID, REDIRECT_URI, SCOPES, SPOTIFY_AUTH_URL, SPOTIFY_TOKEN_URL } from './config';
import { generateCodeVerifier, generateCodeChallenge, generateState } from './pkce';
import { tokenStore, SESSION_KEYS } from './token-store';
import type { TokenResponse } from '../types/spotify';

// ── Login ────────────────────────────────────────────────────────────────────

export async function login(): Promise<void> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Store verifier + state in sessionStorage before redirecting
  sessionStorage.setItem(SESSION_KEYS.CODE_VERIFIER, codeVerifier);
  sessionStorage.setItem(SESSION_KEYS.STATE, state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state,
  });

  window.location.href = `${SPOTIFY_AUTH_URL}?${params}`;
}

// ── Callback ─────────────────────────────────────────────────────────────────

export async function handleCallback(code: string, returnedState: string): Promise<void> {
  const savedState = sessionStorage.getItem(SESSION_KEYS.STATE);
  const codeVerifier = sessionStorage.getItem(SESSION_KEYS.CODE_VERIFIER);

  // CSRF protection — state must match exactly
  if (returnedState !== savedState) {
    throw new Error('State mismatch — possible CSRF attack. Please try logging in again.');
  }
  if (!codeVerifier) {
    throw new Error('Code verifier missing from session. Please try logging in again.');
  }

  // Clean up sessionStorage — these values are single-use
  sessionStorage.removeItem(SESSION_KEYS.STATE);
  sessionStorage.removeItem(SESSION_KEYS.CODE_VERIFIER);

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error_description ?? `Token exchange failed (${response.status})`);
  }

  const data: TokenResponse = await response.json();
  tokenStore.setAccessToken(data.access_token, data.expires_in);
  tokenStore.setRefreshToken(data.refresh_token);
}

// ── Refresh ──────────────────────────────────────────────────────────────────

export async function refreshAccessToken(): Promise<string> {
  const refresh = tokenStore.getRefreshToken();
  if (!refresh) throw new Error('No refresh token available');

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: CLIENT_ID,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    tokenStore.clear();
    throw new Error(`Token refresh failed (${response.status})`);
  }

  const data: TokenResponse = await response.json();
  tokenStore.setAccessToken(data.access_token, data.expires_in);

  // Spotify may return a new refresh_token — always persist it if present
  if (data.refresh_token) {
    tokenStore.setRefreshToken(data.refresh_token);
  }

  return data.access_token;
}

// ── Logout ───────────────────────────────────────────────────────────────────

export function logout(): void {
  tokenStore.clear();
}
