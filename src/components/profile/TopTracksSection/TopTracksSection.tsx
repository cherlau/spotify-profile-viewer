import type { SpotifyTrack } from '../../../types/spotify';
import { TrackItem } from '../TrackItem';
import { LoadingState } from '../../shared/LoadingState';
import styles from './TopTracksSection.module.css';

interface TopTracksSectionProps {
  tracks: SpotifyTrack[];
  isLoading: boolean;
}

/* Limite de tracks exibidas */
const TRACKS_LIMIT = 4;

export function TopTracksSection({ tracks, isLoading }: TopTracksSectionProps) {
  if (isLoading) {
    return <LoadingState message="Loading top tracks…" />;
  }

  if (tracks.length === 0) {
    return null;
  }

  const displayTracks = tracks.slice(0, TRACKS_LIMIT);

  return (
    <section className={styles.section} aria-label="Top Tracks">
      {/* ── Header Mobile ── */}
      <div className={styles.headerMobile}>
        <div className={styles.headerText}>
          <h2 className={styles.titleMobile}>Your Top Tracks</h2>
          <p className={styles.subtitle}>Most played songs this month</p>
        </div>
        <a
          href="https://open.spotify.com/collection/tracks"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.historyLink}
        >
          FULL HISTORY
        </a>
      </div>

      {/* ── Lista Mobile ── */}
      <div className={styles.listMobile} role="list">
        {displayTracks.map((track, index) => (
          <div key={track.id} role="listitem">
            <TrackItem
              rank={index + 1}
              name={track.name}
              artistNames={track.artists.map((a) => a.name)}
              albumName={track.album.name}
              albumImageUrl={track.album.images?.[0]?.url ?? null}
              durationMs={track.duration_ms}
              spotifyUrl={track.external_urls.spotify}
            />
          </div>
        ))}
      </div>

      {/* ── Card Desktop ── */}
      <div className={styles.cardDesktop}>
        <div className={styles.cardHeader}>
          <h2 className={styles.titleDesktop}>Top Tracks</h2>
        </div>
        <div role="list">
          {displayTracks.map((track, index) => (
            <div key={track.id} role="listitem">
              <TrackItem
                rank={index + 1}
                name={track.name}
                artistNames={track.artists.map((a) => a.name)}
                albumName={track.album.name}
                albumImageUrl={track.album.images?.[0]?.url ?? null}
                durationMs={track.duration_ms}
                spotifyUrl={track.external_urls.spotify}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
