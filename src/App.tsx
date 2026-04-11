import { Navigate, Route, Routes } from 'react-router-dom';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { LoginPage } from './pages/LoginPage';
import { CallbackPage } from './pages/CallbackPage';
import { ProfilePage } from './pages/ProfilePage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { LibraryPage } from './pages/LibraryPage';
import { PlayerPage } from './pages/PlayerPage';
import { PodcastsPage } from './pages/PodcastsPage';
import { AppLayout } from './components/layout/AppLayout';
import type { ReactNode } from 'react';

/**
 * Redireciona usuários não autenticados para /login.
 * Aguarda o silent-refresh inicial antes de decidir.
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useSpotifyAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * Layout shell envolvendo todas as rotas protegidas.
 * Expõe Sidebar (desktop), Header, PlayerBar e BottomNav (mobile).
 */
function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<CallbackPage />} />

      {/* Área protegida — todas as páginas abaixo usam o AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <ProfilePage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/playlists"
        element={
          <ProtectedRoute>
            <AppShell>
              <PlaylistsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <AppShell>
              <LibraryPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/player"
        element={
          <ProtectedRoute>
            <AppShell>
              <PlayerPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/podcasts"
        element={
          <ProtectedRoute>
            <AppShell>
              <PodcastsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
