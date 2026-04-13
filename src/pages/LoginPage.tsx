import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

export function LoginPage() {
  const { login, isLoading } = useSpotifyAuth();

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <svg style={styles.logoIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.52 17.28a.748.748 0 0 1-1.03.25c-2.822-1.724-6.376-2.114-10.563-1.158a.748.748 0 1 1-.333-1.458c4.584-1.048 8.515-.596 11.677 1.337a.747.747 0 0 1 .249 1.03zm1.473-3.28a.935.935 0 0 1-1.287.308c-3.23-1.985-8.153-2.56-11.976-1.402a.937.937 0 0 1-.542-1.791c4.363-1.324 9.786-.683 13.497 1.597a.935.935 0 0 1 .308 1.288zm.127-3.408C15.37 8.505 9.218 8.296 5.81 9.34a1.122 1.122 0 1 1-.65-2.148C9.423 5.985 16.224 6.23 20.1 8.53a1.123 1.123 0 0 1-1.08 1.962v.1z" />
          </svg>
          <span style={styles.logoText}>Perfil Spotify</span>
        </div>

        <h1 style={styles.heading}>Sua música,<br />sua história.</h1>
        <p style={styles.subtext}>
          Conecte sua conta do Spotify para explorar seus artistas e faixas favoritos, além de seus hábitos de audição.
        </p>

        <button
          style={isLoading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          onClick={login}
          disabled={isLoading}
        >
          <svg style={styles.buttonIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.52 17.28a.748.748 0 0 1-1.03.25c-2.822-1.724-6.376-2.114-10.563-1.158a.748.748 0 1 1-.333-1.458c4.584-1.048 8.515-.596 11.677 1.337a.747.747 0 0 1 .249 1.03zm1.473-3.28a.935.935 0 0 1-1.287.308c-3.23-1.985-8.153-2.56-11.976-1.402a.937.937 0 0 1-.542-1.791c4.363-1.324 9.786-.683 13.497 1.597a.935.935 0 0 1 .308 1.288zm.127-3.408C15.37 8.505 9.218 8.296 5.81 9.34a1.122 1.122 0 1 1-.65-2.148C9.423 5.985 16.224 6.23 20.1 8.53a1.123 1.123 0 0 1-1.08 1.962v.1z" />
          </svg>
          {isLoading ? 'Conectando…' : 'Conectar com o Spotify'}
        </button>

        <p style={styles.legal}>
          Requer uma conta Premium do Spotify.
          <br />
          Solicitamos apenas permissão de leitura — nunca alteramos sua biblioteca.
        </p>
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
    padding: 'var(--space-24)',
    boxSizing: 'border-box',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
    gap: 'var(--space-24)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-8)',
    color: 'var(--color-accent-text)',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-heading-md-size)',
    fontWeight: 700,
    lineHeight: 'var(--text-heading-md-lh)',
    color: 'var(--color-accent-text)',
    letterSpacing: '-0.4px',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-display-size)',
    fontWeight: 'var(--text-display-weight)' as React.CSSProperties['fontWeight'],
    lineHeight: 'var(--text-display-lh)',
    letterSpacing: 'var(--text-display-ls)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  subtext: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-body-size)',
    lineHeight: 'var(--text-body-lh)',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-8)',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-accent-dark)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-body-lg-size)',
    fontWeight: 700,
    lineHeight: 'var(--text-body-lg-lh)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    padding: '14px var(--space-32)',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-glow-green)',
    transition: 'opacity 0.15s ease',
    width: '100%',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  buttonIcon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  legal: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-caption-size)',
    lineHeight: 'var(--text-caption-lh)',
    color: 'var(--color-text-secondary)',
    margin: 0,
    opacity: 0.7,
  },
};
