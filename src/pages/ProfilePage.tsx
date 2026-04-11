import { useProfile } from '../hooks/useProfile';
import { useTopArtists } from '../hooks/useTopArtists';
import { useTopTracks } from '../hooks/useTopTracks';
import { usePlaylists } from '../hooks/usePlaylists';
import { useFollowedArtists } from '../hooks/useFollowedArtists';
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
  const { data: playlistsData } = usePlaylists(50);
  const { data: followedArtistsData } = useFollowedArtists(50);

  if (profileLoading) {
    return <LoadingState message="Carregando seu perfil…" />;
  }

  if (profileError || !profile) {
    return (
      <ErrorState
        message="Não foi possível carregar seu perfil."
        onRetry={refetch}
      />
    );
  }

  const avatarUrl = profile.images[0]?.url ?? null;
  const artists = topArtistsData?.items ?? [];
  const tracks = topTracksData?.items ?? [];
  const playlistsCount = playlistsData?.total ?? 0;
  const followingCount = followedArtistsData?.artists?.total ?? 0;

  return (
    <div className={styles.page}>
      <ProfileHero
        displayName={profile.display_name ?? profile.id}
        avatarUrl={avatarUrl}
        followers={0}
        following={followingCount}
        playlists={playlistsCount}
        product={profile.product}
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
