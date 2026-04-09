import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';

/**
 * Exposes the Spotify auth state and actions.
 *
 * Must be used inside <AuthProvider>.
 *
 * Returns:
 *   isAuthenticated — whether the user has a valid token
 *   isLoading       — true while the initial silent-refresh is in flight
 *   token           — current access_token (null if not authenticated)
 *   login()         — redirects to Spotify authorize page (PKCE flow)
 *   logout()        — clears all tokens and resets state
 *   syncToken()     — call after handleCallback() to push the new token into context
 */
export function useSpotifyAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useSpotifyAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
