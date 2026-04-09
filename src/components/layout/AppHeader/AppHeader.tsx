import { NavLink } from 'react-router-dom';
import { Search, Settings, Bell } from 'lucide-react';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  /** URL do avatar do usuário autenticado. Null exibe placeholder. */
  avatarUrl?: string | null;
  /** Nome de exibição do usuário (usado no alt do avatar). */
  displayName?: string;
}

const desktopNavLinks = [
  { label: 'Discover', to: '/' },
  { label: 'Radio', to: '/radio' },
  { label: 'Live', to: '/live' },
];

export function AppHeader({ avatarUrl, displayName = 'User' }: AppHeaderProps) {
  const isDesktop = useIsDesktop();

  return (
    <header className={styles.header}>
      {isDesktop ? (
        /* ── Desktop layout ────────────────────────────────────────── */
        <div className={styles.inner}>
          {/* Barra de pesquisa */}
          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search artists, tracks, podcasts…"
              className={styles.searchInput}
              aria-label="Search"
            />
          </div>

          {/* Links de navegação central */}
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

          {/* Ações + avatar */}
          <div className={styles.actions}>
            <button className={styles.iconButton} aria-label="Notifications">
              <Bell size={18} />
            </button>

            {/* Divisor vertical */}
            <div className={styles.divider} />

            {/* Avatar com ring verde */}
            <div className={styles.avatarWrapper}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder} aria-label={displayName} />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── Mobile layout ─────────────────────────────────────────── */
        <div className={styles.inner}>
          {/* Avatar pequeno + logo */}
          <div className={styles.mobileLeft}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className={styles.avatarMobile}
              />
            ) : (
              <div className={styles.avatarMobilePlaceholder} />
            )}
            <span className={styles.mobileLogo}>THE SONIC CURATOR</span>
          </div>

          {/* Botão de settings */}
          <button className={styles.iconButton} aria-label="Settings">
            <Settings size={20} />
          </button>
        </div>
      )}
    </header>
  );
}
