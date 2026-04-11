import { useState } from 'react';
import { Play, Heart, MoreHorizontal, Music } from 'lucide-react';
import type { SpotifyTrack } from '../../../types/spotify';
import { LoadingState } from '../../shared/LoadingState';
import styles from './TopTracksSection.module.css';

interface TopTracksSectionProps {
  tracks: SpotifyTrack[];
  isLoading: boolean;
}

const TRACKS_LIMIT = 4;

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function TrackRow({ track, rank }: { track: SpotifyTrack; rank: number }) {
  const [hovered, setHovered] = useState(false);
  const imageUrl = track.album.images?.[0]?.url ?? null;
  const artistNames = track.artists.map(a => a.name).join(', ');
  const duration = formatDuration(track.duration_ms);

  return (
    <div
      className={styles.trackItem}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={styles.rank}>{rank.toString().padStart(2, '0')}</span>

      <div className={styles.trackArtWrapper}>
        {imageUrl ? (
          <img src={imageUrl} alt={track.album.name} className={styles.trackArt} />
        ) : (
          <div className={styles.trackArtPlaceholder}>
            <Music size={20} />
          </div>
        )}
        {hovered && (
          <div className={styles.playOverlay}>
            <button className={styles.playBtn} aria-label={`Tocar ${track.name}`}>
              <Play size={16} fill="currentColor" />
            </button>
          </div>
        )}
      </div>

      <div className={styles.trackMeta}>
        <span className={styles.trackName}>{track.name}</span>
        <span className={styles.trackSub}>
          {artistNames}
          <span className={styles.trackDot}> • </span>
          <span className={styles.trackDuration}>{duration}</span>
        </span>
      </div>

      <div className={styles.trackActions}>
        <button className={styles.actionBtn} aria-label="Curtir">
          <Heart size={18} />
        </button>
        <button className={styles.actionBtn} aria-label="Mais opções">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}

export function TopTracksSection({ tracks, isLoading }: TopTracksSectionProps) {
  if (isLoading) {
    return <LoadingState message="Carregando suas músicas mais tocadas…" />;
  }

  if (tracks.length === 0) {
    return null;
  }

  const displayTracks = tracks.slice(0, TRACKS_LIMIT);

  return (
    <section className={styles.section} aria-label="Músicas mais tocadas">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Músicas mais tocadas</h2>
        <a
          href="https://open.spotify.com/collection/tracks"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.seeAll}
        >
          VER TUDO
        </a>
      </div>

      <div className={styles.trackList}>
        {displayTracks.map((track, index) => (
          <TrackRow key={track.id} track={track} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}
