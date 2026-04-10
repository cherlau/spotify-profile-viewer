import { BadgeCheck } from 'lucide-react';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import styles from './ProfileHero.module.css';

export interface ProfileHeroProps {
  displayName: string;
  avatarUrl: string | null;
  followers: number;
  following: number;
  playlists: number;
  product: string;
}

export function ProfileHero({ displayName, avatarUrl, followers, following, playlists, product }: ProfileHeroProps) {
  const isDesktop = useIsDesktop();

  return isDesktop ? (
    <DesktopHero
      displayName={displayName}
      avatarUrl={avatarUrl}
      followers={followers}
      following={following}
      playlists={playlists}
      product={product}
    />
  ) : (
    <MobileHero
      displayName={displayName}
      avatarUrl={avatarUrl}
      followers={followers}
      following={following}
      playlists={playlists}
      product={product}
    />
  );
}

/* ── Mobile ─────────────────────────────────────────────────────────────────── */

function MobileHero({ displayName, avatarUrl, followers, following, playlists, product }: ProfileHeroProps) {
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
        <p className={styles.curatorLabel}>{product}</p>
        <h1 className={styles.mobileName}>{displayName}</h1>

        {/* Stats row */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{followers.toLocaleString()}</span>
            <span className={styles.statLabel}>Followers</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{following.toLocaleString()}</span>
            <span className={styles.statLabel}>Following</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{playlists.toLocaleString()}</span>
            <span className={styles.statLabel}>Playlists</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Desktop ─────────────────────────────────────────────────────────────────── */

function DesktopHero({ displayName, avatarUrl, followers, following, playlists, product }: ProfileHeroProps) {
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
            {product}
          </p>
          <h1 className={styles.desktopName}>{displayName}</h1>

          {/* Stats row */}
          <div className={styles.statsRowDesktop}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{followers.toLocaleString()}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{following.toLocaleString()}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{playlists.toLocaleString()}</span>
              <span className={styles.statLabel}>Playlists</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
