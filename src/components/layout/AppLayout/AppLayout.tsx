import type { ReactNode } from 'react';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { Sidebar } from '../Sidebar';
import { AppHeader } from '../AppHeader';
import { PlayerBar } from '../PlayerBar';
import { BottomNav } from '../BottomNav';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
  /** Dados do usuário autenticado para popular header/sidebar */
  avatarUrl?: string | null;
  displayName?: string;
}

export function AppLayout({ children, avatarUrl, displayName }: AppLayoutProps) {
  const isDesktop = useIsDesktop();

  return (
    <div className={styles.root}>
      {/* Sidebar — desktop only */}
      {isDesktop && <Sidebar />}

      {/* Header fixo no topo */}
      <AppHeader avatarUrl={avatarUrl} displayName={displayName} />

      {/* Conteúdo principal com offset para header + sidebar */}
      <main className={`${styles.main} ${isDesktop ? styles.mainDesktop : ''}`}>
        {children}
      </main>

      {/* Player bar — sempre visível quando há faixa tocando */}
      <PlayerBar />

      {/* Bottom nav — mobile only */}
      {!isDesktop && <BottomNav />}
    </div>
  );
}
