import { NavLink } from 'react-router-dom';
import {
  Home,
  Search,
  Library,
  DiscAlbum,
  Mic2,
  Crown,
  Music2,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { icon: Home, label: 'Início', to: '/' },
  { icon: Search, label: 'Buscar', to: '/search' },
  { icon: Music2, label: 'Tocando Agora', to: '/player' },
];

const collectionItems = [
  { icon: Library, label: 'Biblioteca', to: '/library' },
  { icon: DiscAlbum, label: 'Playlists', to: '/playlists' },
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
        <span className={styles.separatorLabel}>Sua Coleção</span>
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
        <p className={styles.premiumTitle}>Membro Premium</p>
        <p className={styles.premiumDesc}>Ouça músicas sem anúncios e pule quantas faixas quiser</p>
        <button className={styles.premiumButton}>Mudar de plano</button>
      </div>
    </aside>
  );
}
