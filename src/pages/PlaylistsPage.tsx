import { useState } from 'react';
import { Play } from 'lucide-react';
import { usePlaylists } from '../hooks/usePlaylists';
import { useProfile } from '../hooks/useProfile';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import { usePlayer } from '../contexts/PlayerContext';
import { ENABLE_REAL_AUDIO } from '../config/featureFlags';
import styles from './PlaylistsPage.module.css';

type Filter = 'all' | 'by_you';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todas as Playlists' },
  { key: 'by_you', label: 'Criadas por você' }
];

export function PlaylistsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const { playTrack } = usePlayer();

  const { data: playlistsData, isLoading: playlistsLoading, isError: playlistsError, refetch } = usePlaylists(50);
  const { data: profile } = useProfile();

  const allPlaylists = playlistsData?.items ?? [];

  const filteredPlaylists = allPlaylists.filter(pl => {
    if (activeFilter === 'by_you') return pl.owner.id === profile?.id;
    return true;
  });

  const [featured, ...standard] = filteredPlaylists;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.headerLabel}>Suas Músicas</span>
        </div>
        <div className={styles.headerBottom}>
          <h1 className={styles.headerTitle}>Playlists.</h1>
        </div>
      </header>

      {playlistsLoading ? (
        <LoadingState/>
      ) : playlistsError ? (
        <ErrorState message="Não foi possível carregar suas playlists." onRetry={refetch} />
      ) : (
        <>
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

          <section className={styles.gridSection}>
            {filteredPlaylists.length === 0 ? (
              <p className={styles.empty}>Nenhuma playlist encontrada.</p>
            ) : (
              <div className={styles.grid}>
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
                          <span className={styles.featuredLabel}>Playlist em destaque</span>
                          <h2 className={styles.featuredName}>{featured.name}</h2>
                          {featured.description && (
                            <p className={styles.featuredDesc}>{featured.description}</p>
                          )}
                        </div>
                        {ENABLE_REAL_AUDIO && (
                          <button className={styles.playButtonLarge} aria-label="Tocar" onClick={() => playTrack(featured.uri)}>
                            <Play size={24} fill="currentColor" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
                      {ENABLE_REAL_AUDIO && (
                        <div className={styles.cardOverlay}>
                          <button className={styles.playButton} aria-label="Tocar" onClick={() => playTrack(pl.uri)}>
                            <Play size={20} fill="currentColor" />
                          </button>
                        </div>
                      )}
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
        </>
      )}
    </div>
  );
}
