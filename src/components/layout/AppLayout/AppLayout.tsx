import type { ReactNode } from 'react';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { Sidebar } from '../Sidebar';
import { AppHeader } from '../AppHeader';
import { PlayerBar } from '../PlayerBar';
import { BottomNav } from '../BottomNav';
import { ENABLE_REAL_AUDIO } from '../../../config/featureFlags';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isDesktop = useIsDesktop();

  return (
    <div className={styles.root}>
      {isDesktop && <Sidebar />}

      {/* Header busca o próprio perfil internamente */}
      <AppHeader />

      <main className={`${styles.main} ${isDesktop ? styles.mainDesktop : ''}`}>
        {children}
      </main>

      {/* Player bar — apenas no Modo Real; no Modo Portfólio é ocultado */}
      {ENABLE_REAL_AUDIO && <PlayerBar />}

      {!isDesktop && <BottomNav />}
    </div>
  );
}
