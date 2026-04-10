import { useState } from 'react';
import {
  Play, Pause, Heart, MoreHorizontal,
  Shuffle, SkipBack, SkipForward, Repeat, Music, Mic2,
} from 'lucide-react';
import { useRecentlyPlayed } from '../hooks/useRecentlyPlayed';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import type { SpotifyTrack } from '../types/spotify';
import styles from './PlayerPage.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── QueueItem ────────────────────────────────────────────────────────────────

interface QueueItemProps {
  track: SpotifyTrack;
  rank: number;
}

function QueueItem({ track, rank }: QueueItemProps) {
  const imageUrl = track.album.images?.[0]?.url ?? null;
  const artistNames = track.artists.map(a => a.name).join(', ');
  const duration = formatDuration(track.duration_ms);

  return (
    <div className={styles.queueItem}>
      <span className={styles.queueRank}>{rank}</span>
      <div className={styles.queueArtWrapper}>
        {imageUrl ? (
          <img src={imageUrl} alt={track.album.name} className={styles.queueArt} />
        ) : (
          <div className={styles.queueArtPlaceholder}>
            <Music size={16} />
          </div>
        )}
      </div>
      <div className={styles.queueMeta}>
        <span className={styles.queueName}>{track.name}</span>
        <span className={styles.queueArtist}>{artistNames}</span>
      </div>
      <span className={styles.queueDuration}>{duration}</span>
    </div>
  );
}

// ─── PlayerPage ───────────────────────────────────────────────────────────────

export function PlayerPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  // Progresso visual estático em % (0-100)
  const [progress, setProgress] = useState(35);

  const { data: recentData, isLoading, isError, refetch } = useRecentlyPlayed(10);

  if (isLoading) return <LoadingState message="Loading player…" />;
  if (isError) return <ErrorState message="Could not load player." onRetry={refetch} />;

  const tracks = recentData?.items.map(i => i.track) ?? [];
  const nowPlaying = tracks[0] ?? null;
  const queue = tracks.slice(1, 4);

  if (!nowPlaying) {
    return (
      <div className={styles.empty}>
        <Music size={48} strokeWidth={1.5} />
        <p>No recently played tracks.</p>
      </div>
    );
  }

  const imageUrl = nowPlaying.album.images?.[0]?.url ?? null;
  const artistNames = nowPlaying.artists.map(a => a.name).join(', ');
  const albumName = nowPlaying.album.name;
  const totalTime = formatDuration(nowPlaying.duration_ms);
  const currentTime = formatDuration(nowPlaying.duration_ms * progress / 100);

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    setProgress(pct);
  }

  function togglePlay() {
    setIsPlaying(p => !p);
  }

  return (
    <div className={styles.page}>
      {/* Fundo desfocado com a capa — visível apenas no desktop */}
      {imageUrl && (
        <div
          className={styles.bgBlur}
          style={{ backgroundImage: `url(${imageUrl})` }}
          aria-hidden="true"
        />
      )}

      <div className={styles.layout}>

        {/* ── Área principal do player ────────────────────────── */}
        <div className={styles.playerArea}>

          {/* Capa do álbum com overlay play */}
          <div className={styles.albumArtWrapper}>
            {imageUrl ? (
              <img src={imageUrl} alt={albumName} className={styles.albumArt} />
            ) : (
              <div className={styles.albumArtPlaceholder}>
                <Music size={80} strokeWidth={1.5} />
              </div>
            )}
            <div className={styles.albumArtOverlay}>
              <button
                className={styles.artPlayBtn}
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying
                  ? <Pause size={40} fill="currentColor" strokeWidth={0} />
                  : <Play size={40} fill="currentColor" strokeWidth={0} />
                }
              </button>
            </div>
          </div>

          {/* Informações da track */}
          <div className={styles.trackInfo}>
            <span className={styles.trackLabel}>{albumName}</span>
            <h1 className={styles.trackTitle}>{nowPlaying.name}</h1>
            <p className={styles.trackArtist}>
              {artistNames}
              <span className={styles.trackDot}> • </span>
              {albumName}
            </p>
          </div>

          {/* Botões de ação: Heart | Play | More */}
          <div className={styles.actionRow}>
            <button
              className={`${styles.actionIconBtn} ${isLiked ? styles.actionIconBtnLiked : ''}`}
              onClick={() => setIsLiked(p => !p)}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
            </button>

            <button
              className={styles.playActionBtn}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying
                ? <Pause size={26} fill="currentColor" strokeWidth={0} />
                : <Play size={26} fill="currentColor" strokeWidth={0} />
              }
            </button>

            <button className={styles.actionIconBtn} aria-label="More options">
              <MoreHorizontal size={24} />
            </button>
          </div>

          {/* Barra de progresso com timestamps */}
          <div className={styles.progressSection}>
            <span className={styles.timestamp}>{currentTime}</span>
            <div
              className={styles.progressBar}
              onClick={handleProgressClick}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              tabIndex={0}
            >
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              <div className={styles.progressThumb} style={{ left: `${progress}%` }} />
            </div>
            <span className={styles.timestamp}>{totalTime}</span>
          </div>

          {/* Controles de playback grandes */}
          <div className={styles.controls}>
            <button className={styles.controlBtn} aria-label="Shuffle">
              <Shuffle size={22} />
            </button>
            <button className={styles.controlBtn} aria-label="Previous">
              <SkipBack size={28} fill="currentColor" strokeWidth={0} />
            </button>
            <button
              className={styles.playLargeBtn}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying
                ? <Pause size={34} fill="currentColor" strokeWidth={0} />
                : <Play size={34} fill="currentColor" strokeWidth={0} />
              }
            </button>
            <button className={styles.controlBtn} aria-label="Next">
              <SkipForward size={28} fill="currentColor" strokeWidth={0} />
            </button>
            <button className={styles.controlBtn} aria-label="Repeat">
              <Repeat size={22} />
            </button>
          </div>

          {/* Next in Queue — visível no mobile, oculto no desktop (está na sidebar) */}
          {queue.length > 0 && (
            <section className={`${styles.queueSection} ${styles.queueMobile}`}>
              <h2 className={styles.queueTitle}>Next in Queue</h2>
              <div className={styles.queueList}>
                {queue.map((track, i) => (
                  <QueueItem key={track.id} track={track} rank={i + 1} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Sidebar desktop — queue + lyrics + about artist ─── */}
        <aside className={styles.desktopSidebar}>

          {/* Next in Queue */}
          <section className={styles.sidePanel}>
            <h2 className={styles.sidePanelTitle}>Next in Queue</h2>
            {queue.length > 0 ? (
              <div className={styles.queueList}>
                {queue.map((track, i) => (
                  <QueueItem key={`desk-${track.id}`} track={track} rank={i + 1} />
                ))}
              </div>
            ) : (
              <p className={styles.sidePanelEmpty}>Queue is empty.</p>
            )}
          </section>

          {/* Lyrics */}
          <section className={styles.sidePanel}>
            <h2 className={styles.sidePanelTitle}>Lyrics</h2>
            <div className={styles.lyricsContent}>
              <p className={styles.lyricsPlaceholder}>
                Lyrics are not available via the Spotify Web API.
                Open Spotify to see synchronized lyrics for this track.
              </p>
            </div>
          </section>

          {/* About Artist */}
          <section className={styles.sidePanel}>
            <h2 className={styles.sidePanelTitle}>
              <Mic2 size={16} />
              About {nowPlaying.artists[0]?.name}
            </h2>
            <div className={styles.aboutContent}>
              {imageUrl && (
                <div className={styles.aboutArtistImg}>
                  <img src={imageUrl} alt={nowPlaying.artists[0]?.name} />
                </div>
              )}
              <p className={styles.aboutText}>
                Explore {nowPlaying.artists[0]?.name}'s full discography, top tracks,
                and related artists on Spotify.
              </p>
              <a
                href={nowPlaying.artists[0]?.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.aboutLink}
              >
                View on Spotify →
              </a>
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
}
