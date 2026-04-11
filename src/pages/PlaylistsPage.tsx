import { useState } from 'react';
import { Play } from 'lucide-react';
import { usePlaylists } from '../hooks/usePlaylists';
import { useProfile } from '../hooks/useProfile';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import styles from './PlaylistsPage.module.css';

type Filter = 'all' | 'by_you';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todas as Playlists' },
  { key: 'by_you', label: 'Criadas por você' }
];

export function PlaylistsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const { data: playlistsData, isLoading: playlistsLoading, isError: playlistsError, refetch } = usePlaylists(50);
  const { data: profile } = useProfile();

  if (playlistsLoading) {
    return <LoadingState message="Carregando sua biblioteca…" />;
  }

  if (playlistsError) {
    return <ErrorState message="Não foi possível carregar suas playlists." onRetry={refetch} />;
  }

  const allPlaylists = playlistsData?.items ?? [];

  const filteredPlaylists = allPlaylists.filter(pl => {
    if (activeFilter === 'by_you') return pl.owner.id === profile?.id;
    return true;
  });

  const [featured, ...standard] = filteredPlaylists;

  return (
    <div className={styles.page}>
      {/* Cabeçalho da página */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.headerLabel}>Suas Músicas</span>
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
          <p className={styles.empty}>Nenhuma playlist encontrada.</p>
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
                      <span className={styles.featuredLabel}>Playlist em destaque</span>
                      <h2 className={styles.featuredName}>{featured.name}</h2>
                      {featured.description && (
                        <p className={styles.featuredDesc}>{featured.description}</p>
                      )}
                    </div>
                    <button className={styles.playButtonLarge} aria-label="Tocar">
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
                    <button className={styles.playButton} aria-label="Tocar">
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
