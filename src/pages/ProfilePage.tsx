import { useCallback } from 'react';
import { useSpotifyQuery } from '../hooks/useSpotifyQuery';
import { getProfile } from '../api/profile';
import { getTopArtists, getTopTracks } from '../api/top';
import { ProfileHero } from '../components/profile/ProfileHero';
import { TopArtistsSection } from '../components/profile/TopArtistsSection';
import { TopTracksSection } from '../components/profile/TopTracksSection';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  /* Fetchers estáveis — não causam re-fetch desnecessário */
  const profileFetcher = useCallback(() => getProfile(), []);
  const artistsFetcher = useCallback(() => getTopArtists({ limit: 10 }), []);
  const tracksFetcher = useCallback(() => getTopTracks({ limit: 4 }), []);

  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useSpotifyQuery(profileFetcher);
  const { data: topArtistsData, isLoading: artistsLoading } = useSpotifyQuery(artistsFetcher);
  const { data: topTracksData, isLoading: tracksLoading } = useSpotifyQuery(tracksFetcher);

  if (profileLoading) {
    return <LoadingState message="Loading your profile…" />;
  }

  if (profileError || !profile) {
    return (
      <ErrorState
        message={profileError ?? 'Could not load your profile.'}
        onRetry={refetchProfile}
      />
    );
  }

  const avatarUrl = profile.images[0]?.url ?? null;
  const artists = topArtistsData?.items ?? [];
  const tracks = topTracksData?.items ?? [];

  return (
    <div className={styles.page}>
      <ProfileHero
        displayName={profile.display_name ?? profile.id}
        avatarUrl={avatarUrl}
        spotifyUrl={profile.external_urls.spotify}
      />

      <div className={styles.sections}>
        <TopArtistsSection
          artists={artists}
          isLoading={artistsLoading}
        />
        <TopTracksSection
          tracks={tracks}
          isLoading={tracksLoading}
        />
      </div>
    </div>
  );
}
