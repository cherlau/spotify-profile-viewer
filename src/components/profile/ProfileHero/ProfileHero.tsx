import { BadgeCheck } from 'lucide-react';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import styles from './ProfileHero.module.css';

function DefaultAvatarIcon({ size }: { size: number }) {
  const iconSize = size * 0.35;
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
	  style={{ marginBottom: '7px' }}
    >
      <circle cx="50" cy="35" r="20" fill="#b3b3b3" />
      <path d="M10 95 Q10 65 50 65 Q90 65 90 95 Z" fill="#b3b3b3" />
    </svg>
  );
}

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

function MobileHero({ displayName, avatarUrl, followers, following, playlists, product }: ProfileHeroProps) {
  return (
    <section className={styles.mobileHero}>
      <div className={styles.avatarRing}>
        <div className={styles.avatarInner}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <DefaultAvatarIcon size={192} />
            </div>
          )}
          <span className={styles.verifiedBadge} aria-label="Verificado">
            <BadgeCheck size={20} />
          </span>
        </div>
      </div>

      <div className={styles.mobileInfo}>
        <p className={styles.curatorLabel}>{product}</p>
        <h1 className={styles.mobileName}>{displayName}</h1>

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{followers.toLocaleString()}</span>
            <span className={styles.statLabel}>Seguidores</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{following.toLocaleString()}</span>
            <span className={styles.statLabel}>Seguindo</span>
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

function DesktopHero({ displayName, avatarUrl, followers, following, playlists, product }: ProfileHeroProps) {
  return (
    <section className={styles.desktopHero}>
      <div className={styles.gradientBanner} aria-hidden="true" />

      <div className={styles.desktopContent}>
        <div className={styles.desktopAvatarWrapper}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className={styles.desktopAvatarImg} />
          ) : (
            <div className={styles.desktopAvatarPlaceholder}>
              <DefaultAvatarIcon size={256} />
            </div>
          )}
        </div>

        <div className={styles.desktopInfo}>
          <p className={styles.verifiedLabelDesktop}>
            <BadgeCheck size={14} className={styles.verifiedIcon} />
            {product}
          </p>
          <h1 className={styles.desktopName}>{displayName}</h1>

          <div className={styles.statsRowDesktop}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{followers.toLocaleString()}</span>
              <span className={styles.statLabel}>Seguidores</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{following.toLocaleString()}</span>
              <span className={styles.statLabel}>Seguindo</span>
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
