import { Navigate, Route, Routes } from 'react-router-dom';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { LoginPage } from './pages/LoginPage';
import { CallbackPage } from './pages/CallbackPage';
import type { ReactNode } from 'react';

/**
 * Redirects unauthenticated users to /login.
 * Shows nothing while the initial silent-refresh is in flight.
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useSpotifyAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<CallbackPage />} />

      {/* Protected area — ProfilePage and other pages will be added here */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {/* Placeholder until ProfilePage is implemented */}
            <div style={{ color: 'var(--color-text-primary)', padding: 'var(--space-48)' }}>
              Dashboard — authenticated ✓
            </div>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
