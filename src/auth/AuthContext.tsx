import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
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

  // Cache para a promessa de refresh em andamento — evita múltiplas chamadas simultâneas
  // (crucial para o React Strict Mode e para navegações rápidas)
  const refreshPromiseRef = useRef<Promise<string> | null>(null);

  const performRefresh = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = refreshAccessToken();
    try {
      const token = await refreshPromiseRef.current;
      return token;
    } finally {
      refreshPromiseRef.current = null;
    }
  }, []);

  // On mount: if there's a refresh_token, attempt a silent refresh
  useEffect(() => {
    let isMounted = true;

    const hasRefreshToken = Boolean(tokenStore.getRefreshToken());
    console.log('[Auth] Inicializando... Tem refresh token?', hasRefreshToken);

    if (!hasRefreshToken) {
      setState({ isAuthenticated: false, isLoading: false, token: null });
      return;
    }

    // In-memory token still valid (e.g. same tab after a re-render) — skip fetch
    const memToken = tokenStore.getAccessToken();
    if (memToken && !tokenStore.isAccessTokenExpired()) {
      console.log('[Auth] Usando token em memória válido.');
      setState({ isAuthenticated: true, isLoading: false, token: memToken });
      return;
    }

    // Attempt silent refresh
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
        
        // Só limpamos se o erro for 400 (Invalid Refresh Token), o spotify-auth.ts já faz isso, 
        // mas aqui atualizamos o estado da UI para deslogar.
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
