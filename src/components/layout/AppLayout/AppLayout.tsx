import type { ReactNode } from 'react';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { Sidebar } from '../Sidebar';
import { AppHeader } from '../AppHeader';
import { PlayerBar } from '../PlayerBar';
import { BottomNav } from '../BottomNav';
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

      {/* Player bar — visível quando há faixa tocando (PlayerBar retorna null sem playback) */}
      <PlayerBar />

      {!isDesktop && <BottomNav />}
    </div>
  );
}
