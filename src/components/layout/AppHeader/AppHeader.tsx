import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, X, LogOut, User, ExternalLink } from 'lucide-react';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { useSpotifyAuth } from '../../../hooks/useSpotifyAuth';
import { useProfile } from '../../../hooks/useProfile';
import styles from './AppHeader.module.css';

const GITHUB_URL = 'https://github.com/cherlau/spotify-profile-viewer';

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function AvatarImage({
  className,
  avatarUrl,
  displayName,
  initial,
}: {
  className: string;
  avatarUrl: string | null;
  displayName: string;
  initial: string;
}) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={displayName} className={className} />;
  }
  return (
    <div className={`${className} ${styles.avatarInitials}`} aria-label={displayName}>
      {initial}
    </div>
  );
}

function AccountMenu({
  alignRight,
  displayName,
  profileUrl,
  onLogout,
}: {
  alignRight?: boolean;
  displayName: string;
  profileUrl: string | null;
  onLogout: () => void;
}) {
  return (
    <div className={`${styles.menu} ${alignRight ? styles.menuRight : styles.menuLeft}`}>
      <div className={styles.menuUser}>
        <User size={13} />
        <span className={styles.menuUserName}>{displayName}</span>
      </div>
      <div className={styles.menuDivider} />
      {profileUrl && (
        <a
          className={styles.menuItem}
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={14} />
          Perfil no Spotify
        </a>
      )}
      <button className={styles.menuItem} onClick={onLogout}>
        <LogOut size={14} />
        Sair
      </button>
    </div>
  );
}

// Isolado para evitar que o AppHeader (e seus hooks de perfil/auth) re-renderize a cada tecla.
function SearchInput({
  initialQuery,
  onQueryChange,
  mode,
}: {
  initialQuery: string;
  onQueryChange: (q: string) => void;
  mode: string | null;
}) {
  const [localQuery, setLocalQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza o estado local quando a URL muda externamente (ex: limpando a busca)
  useEffect(() => {
    setLocalQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (mode === 'search' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  // Debounce para notificar o componente pai sobre a mudança
  useEffect(() => {
    if (localQuery === initialQuery) return;

    const timer = setTimeout(() => {
      onQueryChange(localQuery);
    }, 270);

    return () => clearTimeout(timer);
  }, [localQuery, initialQuery, onQueryChange]);

  function handleClear() {
    setLocalQuery('');
    onQueryChange('');
  }

  return (
    <div className={styles.searchBar}>
      <Search size={16} className={styles.searchIcon} />
      <input
        ref={inputRef}
        type="text"
        value={localQuery}
        onChange={e => setLocalQuery(e.target.value)}
        onKeyDown={e => e.key === 'Escape' && handleClear()}
        placeholder="Buscar artistas, músicas, álbuns…"
        className={styles.searchInput}
        aria-label="Buscar"
      />
      {localQuery && (
        <button className={styles.clearBtn} onClick={handleClear} aria-label="Limpar busca">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function AppHeader() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { logout } = useSpotifyAuth();
  const { data: profile } = useProfile();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const query = searchParams.get('q') ?? '';
  const mode = searchParams.get('mode');

  const displayName = profile?.display_name ?? '';
  const avatarUrl =
    (profile?.images?.find(img => img.height === 64) ?? profile?.images?.[0])?.url ?? null;
  const profileUrl = profile?.external_urls?.spotify ?? null;

  const initial = displayName.trim().charAt(0).toUpperCase() || '?';

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  function handleQueryChange(newQuery: string) {
    if (newQuery.trim()) {
      navigate(`/library?q=${encodeURIComponent(newQuery)}`, {
        replace: location.pathname === '/library',
      });
    } else if (location.pathname === '/library') {
      navigate('/library', { replace: true });
    }
  }

  if (!isDesktop) return null;

  return (
    <header className={styles.header}>
      {isDesktop ? (
        <div className={styles.inner}>
          <SearchInput
            initialQuery={query}
            onQueryChange={handleQueryChange}
            mode={mode}
          />

          <nav className={styles.desktopNav}>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.desktopNavLink}
            >
              <GithubIcon size={16} />
              GitHub
            </a>
          </nav>

          <div className={styles.actions}>
            <div className={styles.divider} />
            <div ref={menuRef} className={styles.avatarWrapper}>
              <button
                className={styles.avatarBtn}
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Menu da conta"
                aria-expanded={menuOpen}
              >
                <AvatarImage
                  className={styles.avatar}
                  avatarUrl={avatarUrl}
                  displayName={displayName}
                  initial={initial}
                />
              </button>
              {menuOpen && (
                <AccountMenu
                  alignRight
                  displayName={displayName}
                  profileUrl={profileUrl}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.inner}>
          <div className={styles.mobileLeft}>
            <div ref={menuRef} className={styles.avatarWrapper}>
              <button
                className={styles.avatarBtn}
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Menu da conta"
                aria-expanded={menuOpen}
              >
                <AvatarImage
                  className={styles.avatarMobile}
                  avatarUrl={avatarUrl}
                  displayName={displayName}
                  initial={initial}
                />
              </button>
              {menuOpen && (
                <AccountMenu
                  displayName={displayName}
                  profileUrl={profileUrl}
                  onLogout={handleLogout}
                />
              )}
            </div>
            <span className={styles.mobileLogo}>Perfil Spotify</span>
          </div>

          {/* Sem ação real — mantido por visual */}
          <div className={styles.iconButton} aria-hidden="true" />
        </div>
      )}
    </header>
  );
}
