import { Heart, Play } from 'lucide-react';
import styles from './TrackItem.module.css';

interface TrackItemProps {
  rank: number;
  name: string;
  artistNames: string[];
  albumName: string;
  albumImageUrl: string | null;
  durationMs: number;
  spotifyUrl: string;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatRank(rank: number): string {
  return rank.toString().padStart(2, '0');
}

export function TrackItem({
  rank,
  name,
  artistNames,
  albumName,
  albumImageUrl,
  durationMs,
  spotifyUrl,
}: TrackItemProps) {
  const artistLabel = artistNames.join(', ');
  const subtitleMobile = `${artistLabel} • ${albumName}`;
  const duration = formatDuration(durationMs);
  const rankLabel = formatRank(rank);

  return (
    <a
      href={spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.row}
      aria-label={`${rankLabel}. ${name} por ${artistLabel}`}
    >
      <span className={styles.rank}>{rankLabel}</span>

      <div className={styles.albumArtWrapper}>
        {albumImageUrl ? (
          <img
            src={albumImageUrl}
            alt={albumName}
            className={styles.albumArt}
            draggable={false}
          />
        ) : (
          <div className={styles.albumArtFallback} aria-hidden="true" />
        )}
        <div className={styles.albumOverlay} aria-hidden="true">
          <Play size={18} fill="currentColor" className={styles.playIcon} />
        </div>
      </div>

      <div className={styles.info}>
        <span className={styles.trackName}>{name}</span>
        {/* Mobile: "artista • album" truncado */}
        <span className={styles.subtitleMobile}>{subtitleMobile}</span>
        {/* Desktop: só artista */}
        <span className={styles.subtitleDesktop}>{artistLabel}</span>
      </div>

      <Heart size={20} className={styles.heartIcon} aria-label="Curtir" />
      <span className={styles.duration}>{duration}</span>
    </a>
  );
}
