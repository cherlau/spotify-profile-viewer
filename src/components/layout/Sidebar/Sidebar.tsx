import { NavLink, useLocation, useSearchParams } from 'react-router-dom';
import {
  Home,
  Search,
  Library,
  DiscAlbum,
  Mic2,
  Music2,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { icon: Home, label: 'Início', to: '/' },
  { icon: Search, label: 'Buscar', to: '/library?mode=search' },
  { icon: Music2, label: 'Tocando Agora', to: '/player' },
];

const collectionItems = [
  { icon: Library, label: 'Biblioteca', to: '/library' },
  { icon: DiscAlbum, label: 'Playlists', to: '/playlists' },
  { icon: Mic2, label: 'Podcasts', to: '/podcasts' },
];

export function Sidebar() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isSearchMode =
    location.pathname === '/library' &&
    (searchParams.get('mode') === 'search' || !!searchParams.get('q'));

  const isLibraryMode = location.pathname === '/library' && !isSearchMode;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoText}>The Sonic Curator</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ icon: Icon, label, to }) => {
          const isActive = to.includes('/library?mode=search') ? isSearchMode : location.pathname === to;
          
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.separator}>
        <span className={styles.separatorLabel}>Sua Coleção</span>
      </div>

      <nav className={styles.collection}>
        {collectionItems.map(({ icon: Icon, label, to }) => {
          const isActive = to === '/library' ? isLibraryMode : location.pathname === to;

          return (
            <NavLink
              key={to}
              to={to}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
