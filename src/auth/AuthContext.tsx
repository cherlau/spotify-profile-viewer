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

  const performRefresh = useCallback(async () => {
    return refreshAccessToken();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hasRefreshToken = Boolean(tokenStore.getRefreshToken());
    console.log('[Auth] Inicializando... Tem refresh token?', hasRefreshToken);

    if (!hasRefreshToken) {
      setState({ isAuthenticated: false, isLoading: false, token: null });
      return;
    }

    const storedToken = tokenStore.getAccessToken();
    if (storedToken && !tokenStore.isAccessTokenExpired()) {
      console.log('[Auth] Usando token em storage válido.');
      setState({ isAuthenticated: true, isLoading: false, token: storedToken });
      return;
    }

    console.log('[Auth] Tentando silent refresh...');
    performRefresh()
      .then(token => {
        if (!isMounted) return;
        console.log('[Auth] Silent refresh com sucesso.');
        setState({ isAuthenticated: true, isLoading: false, token });
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[Auth] Falha no silent refresh:', err.message);
        
        // O spotify-auth.ts já limpa o store em caso de erro 400.
        setState({ isAuthenticated: false, isLoading: false, token: null });
      });

    return () => {
      isMounted = false;
    };
  }, [performRefresh]);

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
