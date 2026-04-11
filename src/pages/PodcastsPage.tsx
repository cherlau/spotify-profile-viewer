import { useSavedShows } from '../hooks/useSavedShows';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import { ExternalLink, Radio } from 'lucide-react';
import type { SpotifyShow } from '../types/spotify';
import styles from './PodcastsPage.module.css';

function ShowCard({ show }: { show: SpotifyShow }) {
  // Encontra a imagem com o maior height (maior resolução)
  const imageUrl = show.images?.reduce((prev, current) => {
    return (prev.height ?? 0) > (current.height ?? 0) ? prev : current;
  }, show.images[0])?.url ?? null;

  return (
    <a
      href={show.external_urls.spotify}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.showCard}
    >
      <div className={styles.showArtWrapper}>
        {imageUrl ? (
          <img src={imageUrl} alt={show.name} className={styles.showArt} />
        ) : (
          <div className={styles.showArtPlaceholder}>
            <Radio size={40} />
          </div>
        )}
      </div>
      <div className={styles.showInfo}>
        <div className={styles.showHeader}>
          <h3 className={styles.showName}>{show.name}</h3>
          <div className={styles.actionBtn} aria-hidden="true">
            <ExternalLink size={20} />
          </div>
        </div>
        <p className={styles.showPublisher}>{show.publisher}</p>
        <p className={styles.showDescription}>{show.description}</p>
        <div className={styles.showMeta}>
          {show.total_episodes != null && (
            <span className={styles.episodeCount}>{show.total_episodes} episódios</span>
          )}
        </div>
      </div>
    </a>
  );
}

export function PodcastsPage() {
  const { data, isLoading, isError, refetch } = useSavedShows(50);
  const shows = data?.items.map(i => i.show) ?? [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.headerLabel}>Seus Podcasts</span>
        <h1 className={styles.headerTitle}>Podcasts</h1>
        <p className={styles.headerDesc}>
          Seus programas e episódios favoritos, tudo em um só lugar.
        </p>
      </header>

      {isLoading ? (
        <LoadingState message="Carregando podcasts..." />
      ) : isError ? (
        <ErrorState message="Não foi possível carregar os podcasts." onRetry={refetch} />
      ) : shows.length === 0 ? (
        <p className={styles.empty}>Nenhum podcast na sua biblioteca ainda.</p>
      ) : (
        <div className={styles.showList}>
          {shows.map(item => (
            <ShowCard key={item.id} show={item} />
          ))}
        </div>
      )}
    </div>
  );
}
