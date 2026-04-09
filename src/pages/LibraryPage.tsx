import { useState, useCallback } from 'react';
import { Play, Heart, MoreHorizontal, Music } from 'lucide-react';
import { useSpotifyQuery } from '../hooks/useSpotifyQuery';
import { getRecentlyPlayed } from '../api/recentlyPlayed';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import type { SpotifyTrack } from '../types/spotify';
import styles from './LibraryPage.module.css';

type Tab = 'music' | 'albums' | 'artists' | 'podcasts';

const TABS: { key: Tab; label: string }[] = [
  { key: 'music', label: 'Music' },
  { key: 'albums', label: 'Albums' },
  { key: 'artists', label: 'Artists' },
  { key: 'podcasts', label: 'Podcasts' },
];

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Remove duplicatas pelo id da track, mantendo a mais recente. */
function deduplicateTracks(tracks: SpotifyTrack[]): SpotifyTrack[] {
  const seen = new Set<string>();
  return tracks.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

interface TrackRowProps {
  track: SpotifyTrack;
}

function TrackRow({ track }: TrackRowProps) {
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
      {/* Capa com overlay play */}
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
            <button className={styles.playBtn} aria-label={`Play ${track.name}`}>
              <Play size={16} fill="currentColor" />
            </button>
          </div>
        )}
      </div>

      {/* Nome e metadados */}
      <div className={styles.trackMeta}>
        <span className={styles.trackName}>{track.name}</span>
        <span className={styles.trackSub}>
          {artistNames}
          <span className={styles.trackDot}> • </span>
          <span className={styles.trackDuration}>{duration}</span>
        </span>
      </div>

      {/* Ações */}
      <div className={styles.trackActions}>
        <button className={styles.actionBtn} aria-label="Like">
          <Heart size={18} />
        </button>
        <button className={styles.actionBtn} aria-label="More options">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}


export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('music');

  const recentFetcher = useCallback(() => getRecentlyPlayed({ limit: 50 }), []);

  const {
    data: recentData,
    isLoading: recentLoading,
    error: recentError,
    refetch,
  } = useSpotifyQuery(recentFetcher);

  if (recentLoading) {
    return <LoadingState message="Loading your library…" />;
  }

  if (recentError) {
    return <ErrorState message={recentError} onRetry={refetch} />;
  }

  const rawTracks = (recentData?.items ?? []).map(item => item.track);
  const tracks = deduplicateTracks(rawTracks);

  return (
    <div className={styles.page}>
      {/* Header editorial */}
      <header className={styles.header}>
        <span className={styles.headerLabel}>Your Collection</span>
        <h1 className={styles.headerTitle}>Your Library</h1>
        <p className={styles.headerDesc}>
          Everything you've saved, played, and loved — all in one place.
        </p>
      </header>

      {/* Tabs de categoria */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabs}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de tracks (apenas na aba Music) */}
      {activeTab === 'music' && (
        <section className={styles.tracksSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recently Played</h2>
            <button className={styles.seeAll}>SEE ALL</button>
          </div>

          {tracks.length === 0 ? (
            <p className={styles.empty}>No tracks found.</p>
          ) : (
            <div className={styles.trackList}>
              {tracks.slice(0, 20).map(track => (
                <TrackRow key={track.id} track={track} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tabs sem conteúdo ainda */}
      {activeTab !== 'music' && (
        <section className={styles.tracksSection}>
          <p className={styles.empty}>
            {activeTab === 'podcasts'
              ? 'No podcasts in your library yet.'
              : activeTab === 'albums'
                ? 'No saved albums yet.'
                : 'No followed artists yet.'}
          </p>
        </section>
      )}

    </div>
  );
}
