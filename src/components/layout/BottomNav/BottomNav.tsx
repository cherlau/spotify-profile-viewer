import { NavLink } from 'react-router-dom';
import { Home, Search, Library, User } from 'lucide-react';
import styles from './BottomNav.module.css';

const navItems = [
  { icon: Home, label: 'Início', to: '/' },
  { icon: Search, label: 'Buscar', to: '/search' },
  { icon: Library, label: 'Biblioteca', to: '/library' },
  { icon: User, label: 'Perfil', to: '/profile' },
];

export function BottomNav() {
  return (
    <nav className={styles.bottomNav} aria-label="Navegação principal">
      {navItems.map(({ icon: Icon, label, to }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
          }
          aria-label={label}
        >
          {({ isActive }) => (
            <span className={`${styles.iconWrapper} ${isActive ? styles.iconWrapperActive : ''}`}>
              <Icon size={20} />
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
