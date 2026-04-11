import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleCallback } from '../auth/spotify-auth';
import { tokenStore } from '../auth/token-store';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

type Status = 'loading' | 'error';

export function CallbackPage() {
  const navigate = useNavigate();
  const { syncToken } = useSpotifyAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  // Prevent StrictMode double-invocation from exchanging the code twice
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    // Edge case 1: user denied permission
    if (error) {
      setErrorMessage(
        error === 'access_denied'
          ? 'Você negou o acesso à sua conta do Spotify.'
          : `O Spotify retornou um erro: ${error}`,
      );
      setStatus('error');
      return;
    }

    // Edge case 2: missing required params
    if (!code || !state) {
      setErrorMessage('Callback inválido — parâmetros obrigatórios ausentes.');
      setStatus('error');
      return;
    }

    handleCallback(code, state)
      .then(() => {
        const token = tokenStore.getAccessToken();
        if (token) syncToken(token);
        navigate('/', { replace: true });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Falha na autenticação.';
        setErrorMessage(message);
        setStatus('error');
      });
  }, [navigate, syncToken]);

  if (status === 'error') {
    return (
      <div style={styles.root}>
        <div style={styles.card}>
          <div style={styles.errorIcon} aria-hidden="true">✕</div>
          <h1 style={styles.heading}>Falha na autenticação</h1>
          <p style={styles.message}>{errorMessage}</p>
          <button style={styles.button} onClick={() => navigate('/login', { replace: true })}>
            Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.spinner} role="status" aria-label="Autenticando…" />
        <p style={styles.message}>Conectando ao Spotify…</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100svh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-bg-primary)',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--space-16)',
    padding: 'var(--space-24)',
  },
  spinner: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-full)',
    border: '3px solid var(--color-bg-elevated)',
    borderTopColor: 'var(--color-accent)',
    animation: 'spin 0.8s linear infinite',
  },
  errorIcon: {
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(255, 59, 59, 0.15)',
    color: '#ff3b3b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 700,
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-heading-lg-size)',
    fontWeight: 700,
    lineHeight: 'var(--text-heading-lg-lh)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  message: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-body-size)',
    lineHeight: 'var(--text-body-lh)',
    color: 'var(--color-text-secondary)',
    margin: 0,
    maxWidth: '320px',
  },
  button: {
    backgroundColor: 'var(--color-bg-elevated)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-body-size)',
    fontWeight: 600,
    border: 'none',
    borderRadius: 'var(--radius-full)',
    padding: '12px var(--space-24)',
    cursor: 'pointer',
    marginTop: 'var(--space-8)',
  },
};
