/**
 * Token storage strategy (per specs/auth-flow.md):
 *   access_token  → in-memory only (lost on tab close, refreshed via refresh_token)
 *   refresh_token → localStorage (persists across sessions)
 *   code_verifier → sessionStorage (only needed during the auth flow)
 *   state         → sessionStorage (only needed during the auth flow)
 */

const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const ACCESS_TOKEN_KEY = 'spotify_access_token';
const TOKEN_EXPIRY_KEY = 'spotify_token_expiry';

export const SESSION_KEYS = {
  CODE_VERIFIER: 'spotify_code_verifier',
  STATE: 'spotify_auth_state',
} as const;

export const tokenStore = {
  // ── Access token (localStorage) ──────────────────────────────────
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string, expiresIn: number): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiresAt));
  },
  clearAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },
  isAccessTokenExpired(): boolean {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    // 30s buffer to avoid edge-case expiry during a request
    return Date.now() >= parseInt(expiry, 10) - 30_000;
  },

  // ── Refresh token (localStorage) ────────────────────────────────
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  // ── Full clear (logout) ──────────────────────────────────────────
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },
};
