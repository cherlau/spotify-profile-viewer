import { useState, useCallback } from 'react';
import { Play, Heart, ExternalLink } from 'lucide-react';
import { useSpotifyQuery } from '../hooks/useSpotifyQuery';
import { getPlaylists } from '../api/playlists';
import { getRecentlyPlayed } from '../api/recentlyPlayed';
import { getProfile } from '../api/profile';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import styles from './PlaylistsPage.module.css';

type Filter = 'all' | 'recent' | 'by_you' | 'liked';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Playlists' },
  { key: 'recent', label: 'Recently Added' },
  { key: 'by_you', label: 'By You' },
  { key: 'liked', label: 'Liked' },
];

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function PlaylistsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const playlistsFetcher = useCallback(() => getPlaylists({ limit: 50 }), []);
  const recentFetcher = useCallback(() => getRecentlyPlayed({ limit: 10 }), []);
  const profileFetcher = useCallback(() => getProfile(), []);

  const {
    data: playlistsData,
    isLoading: playlistsLoading,
    error: playlistsError,
    refetch,
  } = useSpotifyQuery(playlistsFetcher);
  const { data: recentData } = useSpotifyQuery(recentFetcher);
  const { data: profile } = useSpotifyQuery(profileFetcher);

  if (playlistsLoading) {
    return <LoadingState message="Loading your library…" />;
  }

  if (playlistsError) {
    return <ErrorState message={playlistsError} onRetry={refetch} />;
  }

  const allPlaylists = playlistsData?.items ?? [];
  const recentTracks = recentData?.items ?? [];

  const filteredPlaylists = allPlaylists.filter(pl => {
    if (activeFilter === 'by_you') return pl.owner.id === profile?.id;
    if (activeFilter === 'liked') return pl.name.toLowerCase().includes('liked');
    return true;
  });

  const [featured, ...standard] = filteredPlaylists;

  return (
    <div className={styles.page}>
      {/* Cabeçalho da página */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.headerLabel}>Your Collection</span>
        </div>
        <div className={styles.headerBottom}>
          <h1 className={styles.headerTitle}>Library.</h1>
          <button className={styles.createButton}>Create Playlist</button>
        </div>
      </header>

      {/* Filtros rápidos horizontais */}
      <div className={styles.filtersWrapper}>
        <div className={styles.filters}>
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.filterPill} ${activeFilter === key ? styles.filterPillActive : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de playlists */}
      <section className={styles.gridSection}>
        {filteredPlaylists.length === 0 ? (
          <p className={styles.empty}>No playlists found.</p>
        ) : (
          <div className={styles.grid}>
            {/* Card em destaque */}
            {featured && (
              <div className={`${styles.card} ${styles.cardFeatured}`}>
                <div className={styles.cardImageWrapper}>
                  {featured.images?.[0] ? (
                    <img
                      src={featured.images[0].url}
                      alt={featured.name}
                      className={styles.cardImage}
                    />
                  ) : (
                    <div className={styles.cardImagePlaceholder} />
                  )}
                  <div className={styles.featuredOverlay}>
                    <div className={styles.featuredMeta}>
                      <span className={styles.featuredLabel}>Featured Playlist</span>
                      <h2 className={styles.featuredName}>{featured.name}</h2>
                      {featured.description && (
                        <p className={styles.featuredDesc}>{featured.description}</p>
                      )}
                    </div>
                    <button className={styles.playButtonLarge} aria-label="Play">
                      <Play size={24} fill="currentColor" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cards padrão */}
            {standard.map(pl => (
              <div key={pl.id} className={styles.card}>
                <div className={styles.cardImageWrapper}>
                  {pl.images?.[0] ? (
                    <img
                      src={pl.images[0].url}
                      alt={pl.name}
                      className={styles.cardImage}
                    />
                  ) : (
                    <div className={styles.cardImagePlaceholder} />
                  )}
                  <div className={styles.cardOverlay}>
                    <button className={styles.playButton} aria-label="Play">
                      <Play size={20} fill="currentColor" />
                    </button>
                  </div>
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.cardName}>{pl.name}</span>
                  <span className={styles.cardAuthor}>
                    {pl.owner.display_name ?? pl.owner.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Seção Recently Played */}
      {recentTracks.length > 0 && (
        <section className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Recently Played</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thTrack}>Track</th>
                  <th className={styles.thActions}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTracks.map((item, i) => (
                  <tr key={`${item.track.id}-${i}`} className={styles.tableRow}>
                    <td className={styles.tdTrack}>
                      <div className={styles.trackInfo}>
                        {item.track.album.images?.[0] ? (
                          <img
                            src={item.track.album.images[0].url}
                            alt={item.track.album.name}
                            className={styles.trackArt}
                          />
                        ) : (
                          <div className={styles.trackArtPlaceholder} />
                        )}
                        <div className={styles.trackMeta}>
                          <span className={styles.trackName}>{item.track.name}</span>
                          <span className={styles.trackArtist}>
                            {item.track.artists.map(a => a.name).join(', ')}
                            {' · '}
                            {formatDuration(item.track.duration_ms)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.tdActions}>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} aria-label="Like">
                          <Heart size={16} />
                        </button>
                        <a
                          href={item.track.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.actionBtn}
                          aria-label="Open in Spotify"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
