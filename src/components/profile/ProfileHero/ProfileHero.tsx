import { MoreHorizontal, BadgeCheck } from 'lucide-react';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import styles from './ProfileHero.module.css';

export interface ProfileHeroProps {
  displayName: string;
  avatarUrl: string | null;
  spotifyUrl: string;
}

export function ProfileHero({ displayName, avatarUrl, spotifyUrl }: ProfileHeroProps) {
  const isDesktop = useIsDesktop();

  return isDesktop ? (
    <DesktopHero
      displayName={displayName}
      avatarUrl={avatarUrl}
      spotifyUrl={spotifyUrl}
    />
  ) : (
    <MobileHero
      displayName={displayName}
      avatarUrl={avatarUrl}
      spotifyUrl={spotifyUrl}
    />
  );
}

/* ── Mobile ─────────────────────────────────────────────────────────────────── */

function MobileHero({ displayName, avatarUrl, spotifyUrl }: ProfileHeroProps) {
  return (
    <section className={styles.mobileHero}>
      {/* Avatar com borda gradient */}
      <div className={styles.avatarRing}>
        <div className={styles.avatarInner}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarPlaceholder} />
          )}
          {/* Badge verificado */}
          <span className={styles.verifiedBadge} aria-label="Verified">
            <BadgeCheck size={20} />
          </span>
        </div>
      </div>

      {/* Informações abaixo do avatar */}
      <div className={styles.mobileInfo}>
        <p className={styles.curatorLabel}>Verified Curator</p>
        <h1 className={styles.mobileName}>{displayName}</h1>

        {/* Stats — followers/following removidos da API em Fev/2026; seção oculta */}

        {/* Botões de ação */}
        <div className={styles.actionRow}>
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.followBtn}
          >
            Follow
          </a>
          <button className={styles.moreBtn} aria-label="More options">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Desktop ─────────────────────────────────────────────────────────────────── */

function DesktopHero({ displayName, avatarUrl, spotifyUrl }: ProfileHeroProps) {
  return (
    <section className={styles.desktopHero}>
      {/* Gradient banner de fundo */}
      <div className={styles.gradientBanner} aria-hidden="true" />

      {/* Conteúdo sobre o banner */}
      <div className={styles.desktopContent}>
        {/* Avatar */}
        <div className={styles.desktopAvatarWrapper}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className={styles.desktopAvatarImg} />
          ) : (
            <div className={styles.desktopAvatarPlaceholder} />
          )}
        </div>

        {/* Informações à direita do avatar */}
        <div className={styles.desktopInfo}>
          <p className={styles.verifiedLabelDesktop}>
            <BadgeCheck size={14} className={styles.verifiedIcon} />
            Verified Curator
          </p>
          <h1 className={styles.desktopName}>{displayName}</h1>

          {/* Stats — followers/following não disponíveis (removidos API Fev/2026) */}

          <div className={styles.desktopActionRow}>
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.followBtnDesktop}
            >
              Follow
            </a>
            <button className={styles.moreBtnDesktop} aria-label="More options">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
