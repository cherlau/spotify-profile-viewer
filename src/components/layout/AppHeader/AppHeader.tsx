import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, X, LogOut, User, ExternalLink } from 'lucide-react';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { useSpotifyAuth } from '../../../hooks/useSpotifyAuth';
import { useProfile } from '../../../hooks/useProfile';
import styles from './AppHeader.module.css';

const desktopNavLinks = [
  { label: 'Descobrir', to: '/' },
  { label: 'Playlists', to: '/playlists' },
  { label: 'Biblioteca', to: '/library' },
];

// Foto se disponível, inicial caso contrário
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

// Dropdown de conta
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

export function AppHeader() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { logout } = useSpotifyAuth();
  const { data: profile } = useProfile();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Query de busca derivada diretamente da URL
  const query = searchParams.get('q') ?? '';

  // Dados do usuário vindos da API
  const displayName = profile?.display_name ?? '';
  const avatarUrl =
    (profile?.images?.find(img => img.height === 64) ?? profile?.images?.[0])?.url ?? null;
  const profileUrl = profile?.external_urls?.spotify ?? null;

  // Inicial para o placeholder do avatar
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';

  // Fecha o dropdown ao clicar fora (subscrevendo evento DOM — uso legítimo de useEffect)
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

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value.trim()) {
      navigate(`/library?q=${encodeURIComponent(value)}`, {
        replace: location.pathname === '/library',
      });
    } else if (location.pathname === '/library') {
      navigate('/library', { replace: true });
    }
  }

  function handleClear() {
    if (location.pathname === '/library') {
      navigate('/library', { replace: true });
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') handleClear();
  }

  if (!isDesktop) return null;

  return (
    <header className={styles.header}>
      {isDesktop ? (
        /* ── Desktop ───────────────────────────────────────────────── */
        <div className={styles.inner}>
          {/* Barra de pesquisa */}
          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar artistas, músicas, podcasts…"
              className={styles.searchInput}
              aria-label="Buscar"
            />
            {query && (
              <button className={styles.clearBtn} onClick={handleClear} aria-label="Limpar busca">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Links de navegação */}
          <nav className={styles.desktopNav}>
            {desktopNavLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `${styles.desktopNavLink} ${isActive ? styles.desktopNavLinkActive : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Avatar + dropdown de conta */}
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
        /* ── Mobile ────────────────────────────────────────────────── */
        <div className={styles.inner}>
          <div className={styles.mobileLeft}>
            {/* Avatar clicável com dropdown */}
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
            <span className={styles.mobileLogo}>THE SONIC CURATOR</span>
          </div>

          {/* Sem ação real — mantido por visual */}
          <div className={styles.iconButton} aria-hidden="true" />
        </div>
      )}
    </header>
  );
}
