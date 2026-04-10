import { useProfile } from '../hooks/useProfile';
import { useTopArtists } from '../hooks/useTopArtists';
import { useTopTracks } from '../hooks/useTopTracks';
import { ProfileHero } from '../components/profile/ProfileHero';
import { TopArtistsSection } from '../components/profile/TopArtistsSection';
import { TopTracksSection } from '../components/profile/TopTracksSection';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { data: profile, isLoading: profileLoading, isError: profileError, refetch } = useProfile();
  const { data: topArtistsData, isLoading: artistsLoading } = useTopArtists(10);
  const { data: topTracksData, isLoading: tracksLoading } = useTopTracks(4);

  if (profileLoading) {
    return <LoadingState message="Loading your profile…" />;
  }

  if (profileError || !profile) {
    return (
      <ErrorState
        message="Could not load your profile."
        onRetry={refetch}
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
