import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { login as spotifyLogin, logout as spotifyLogout, refreshAccessToken } from './spotify-auth';
import { tokenStore } from './token-store';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  logout: () => void;
  /** Call after handleCallback() to sync token into context state */
  syncToken: (token: string) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  // On mount: if there's a refresh_token, attempt a silent refresh
  useEffect(() => {
    const hasRefreshToken = Boolean(tokenStore.getRefreshToken());

    if (!hasRefreshToken) {
      setState({ isAuthenticated: false, isLoading: false, token: null });
      return;
    }

    // In-memory token still valid (e.g. same tab after a re-render) — skip fetch
    const memToken = tokenStore.getAccessToken();
    if (memToken && !tokenStore.isAccessTokenExpired()) {
      setState({ isAuthenticated: true, isLoading: false, token: memToken });
      return;
    }

    // Attempt silent refresh
    refreshAccessToken()
      .then(token => {
        setState({ isAuthenticated: true, isLoading: false, token });
      })
      .catch(() => {
        // Refresh token is invalid — user must log in again
        tokenStore.clear();
        setState({ isAuthenticated: false, isLoading: false, token: null });
      });
  }, []);

  const login = useCallback(async () => {
    await spotifyLogin();
  }, []);

  const logout = useCallback(() => {
    spotifyLogout();
    setState({ isAuthenticated: false, isLoading: false, token: null });
  }, []);

  const syncToken = useCallback((token: string) => {
    setState({ isAuthenticated: true, isLoading: false, token });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, syncToken }}>
      {children}
    </AuthContext.Provider>
  );
}
