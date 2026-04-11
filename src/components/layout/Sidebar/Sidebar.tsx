import { NavLink } from 'react-router-dom';
import {
  Home,
  Search,
  Library,
  PlusSquare,
  Heart,
  Mic2,
  Crown,
  Music2,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Search, label: 'Search', to: '/search' },
  { icon: Music2, label: 'Now Playing', to: '/player' },
];

const collectionItems = [
  { icon: Library, label: 'Library', to: '/library' },
  { icon: Library, label: 'Playlists', to: '/playlists' },
  { icon: Mic2, label: 'Podcasts', to: '/podcasts' },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoText}>The Sonic Curator</span>
      </div>

      {/* Navegação principal */}
      <nav className={styles.nav}>
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Separador "YOUR COLLECTION" */}
      <div className={styles.separator}>
        <span className={styles.separatorLabel}>Your Collection</span>
      </div>

      {/* Sub-itens da coleção */}
      <nav className={styles.collection}>
        {collectionItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Card Premium no rodapé */}
      <div className={styles.premiumCard}>
        <Crown size={16} className={styles.premiumIcon} />
        <p className={styles.premiumTitle}>Premium Member</p>
        <p className={styles.premiumDesc}>Enjoy unlimited skips and ad-free listening</p>
        <button className={styles.premiumButton}>Upgrade Plan</button>
      </div>
    </aside>
  );
}
