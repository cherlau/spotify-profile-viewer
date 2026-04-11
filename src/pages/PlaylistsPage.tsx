import { useState } from 'react';
import { Play } from 'lucide-react';
import { usePlaylists } from '../hooks/usePlaylists';
import { useProfile } from '../hooks/useProfile';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import styles from './PlaylistsPage.module.css';

type Filter = 'all' | 'by_you';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Playlists' },
  { key: 'by_you', label: 'By You' }
];

export function PlaylistsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const { data: playlistsData, isLoading: playlistsLoading, isError: playlistsError, refetch } = usePlaylists(50);
  const { data: profile } = useProfile();

  if (playlistsLoading) {
    return <LoadingState message="Loading your library…" />;
  }

  if (playlistsError) {
    return <ErrorState message="Could not load your playlists." onRetry={refetch} />;
  }

  const allPlaylists = playlistsData?.items ?? [];

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
          <span className={styles.headerLabel}>Your Music</span>
        </div>
        <div className={styles.headerBottom}>
          <h1 className={styles.headerTitle}>Playlists.</h1>
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

    </div>
  );
}
