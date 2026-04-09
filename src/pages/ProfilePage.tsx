import { useCallback } from 'react';
import { useSpotifyQuery } from '../hooks/useSpotifyQuery';
import { getProfile } from '../api/profile';
import { ProfileHero } from '../components/profile/ProfileHero';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  /* Fetcher estável — não causa re-fetch desnecessário */
  const fetcher = useCallback(() => getProfile(), []);
  const { data: profile, isLoading, error, refetch } = useSpotifyQuery(fetcher);

  if (isLoading) {
    return <LoadingState message="Loading your profile…" />;
  }

  if (error || !profile) {
    return (
      <ErrorState
        message={error ?? 'Could not load your profile.'}
        onRetry={refetch}
      />
    );
  }

  const avatarUrl = profile.images[0]?.url ?? null;

  return (
    <div className={styles.page}>
      <ProfileHero
        displayName={profile.display_name ?? profile.id}
        avatarUrl={avatarUrl}
        spotifyUrl={profile.external_urls.spotify}
      />

      {/* Seções futuras: TopArtists, TopTracks, RecentlyListened */}
      <div className={styles.sections}>
        {/* placeholder */}
      </div>
    </div>
  );
}
