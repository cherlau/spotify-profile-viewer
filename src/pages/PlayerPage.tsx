import { useState, useEffect } from 'react';
import { Music, Mic2 } from 'lucide-react';
import { usePlaybackState } from '../hooks/usePlaybackState';
import { useQueue } from '../hooks/useQueue';
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
  const [isActive, setIsActive] = useState(true);

  // O polling é configurado aqui e desativado quando isActive for false
  const { data: playback, isLoading, isError, refetch } = usePlaybackState({
    refetchInterval: isActive ? 4000 : false,
    enabled: isActive,
  });

  const { data: queueData } = useQueue({
    refetchInterval: isActive ? 4000 : false,
    enabled: isActive,
  });

  // Garante que o polling pare imediatamente ao navegar para fora
  useEffect(() => {
    setIsActive(true);
    return () => setIsActive(false);
  }, []);

  if (isLoading) return <LoadingState message="Conectando ao seu Spotify…" />;
  if (isError) return <ErrorState message="Não foi possível carregar o player." onRetry={refetch} />;

  if (!playback || !playback.item) {
    return (
      <div className={styles.empty}>
        <Music size={48} strokeWidth={1.5} />
        <p>Nenhuma música tocando agora ou nenhum dispositivo ativo.</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
          Abra o Spotify em um dispositivo para começar a ouvir.
        </p>
      </div>
    );
  }

  const nowPlaying = playback.item;
  // Busca a fila real da API e limita aos primeiros 4 itens
  const queue: SpotifyTrack[] = queueData?.queue?.slice(0, 4) ?? [];

  const imageUrl = nowPlaying.album.images?.[0]?.url ?? null;
  const artistNames = nowPlaying.artists.map(a => a.name).join(', ');
  const albumName = nowPlaying.album.name;

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

          {/* Capa do álbum */}
          <div className={styles.albumArtWrapper}>
            {imageUrl ? (
              <img src={imageUrl} alt={albumName} className={styles.albumArt} />
            ) : (
              <div className={styles.albumArtPlaceholder}>
                <Music size={80} strokeWidth={1.5} />
              </div>
            )}
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

          {/* Next in Queue — visível no mobile, oculto no desktop (está na sidebar) */}
          {queue.length > 0 && (
            <section className={`${styles.queueSection} ${styles.queueMobile}`}>
              <h2 className={styles.queueTitle}>Próxima na fila</h2>
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
            <h2 className={styles.sidePanelTitle}>Próxima na fila</h2>
            {queue.length > 0 ? (
              <div className={styles.queueList}>
                {queue.map((track, i) => (
                  <QueueItem key={`desk-${track.id}`} track={track} rank={i + 1} />
                ))}
              </div>
            ) : (
              <p className={styles.sidePanelEmpty}>A fila está vazia ou não disponível.</p>
            )}
          </section>

          {/* Lyrics */}
          <section className={styles.sidePanel}>
            <h2 className={styles.sidePanelTitle}>Letras</h2>
            <div className={styles.lyricsContent}>
              <p className={styles.lyricsPlaceholder}>
                As letras não estão disponíveis via API do Spotify.
                Abra o Spotify para ver as letras sincronizadas desta faixa.
              </p>
            </div>
          </section>

          {/* About Artist */}
          <section className={styles.sidePanel}>
            <h2 className={styles.sidePanelTitle}>
              <Mic2 size={16} />
              Sobre {nowPlaying.artists[0]?.name}
            </h2>
            <div className={styles.aboutContent}>
              {imageUrl && (
                <div className={styles.aboutArtistImg}>
                  <img src={imageUrl} alt={nowPlaying.artists[0]?.name} />
                </div>
              )}
              <p className={styles.aboutText}>
                Explore a discografia completa de {nowPlaying.artists[0]?.name}, suas principais faixas e artistas relacionados no Spotify.
              </p>
              <a
                href={nowPlaying.artists[0]?.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.aboutLink}
              >
                Ver no Spotify →
              </a>
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
}
