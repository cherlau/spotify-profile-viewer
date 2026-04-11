import { useState, useEffect } from 'react';
import {
  Play, Pause, Heart, MoreHorizontal,
  Shuffle, SkipBack, SkipForward, Repeat, Music, Mic2,
} from 'lucide-react';
import { usePlaybackState } from '../hooks/usePlaybackState';
import { useQueue } from '../hooks/useQueue';
import { play, pause, next, previous, seek, toggleShuffle, setRepeatMode } from '../api/player';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/queryKeys';
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
  const queryClient = useQueryClient();
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

  const [isLiked, setIsLiked] = useState(false);
  const [localProgressMs, setLocalProgressMs] = useState<number | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Garante que o polling pare imediatamente ao navegar para fora
  useEffect(() => {
    setIsActive(true);
    return () => setIsActive(false);
  }, []);

  // Sincroniza o progresso local quando o playback muda
  useEffect(() => {
    if (playback?.progress_ms !== undefined) {
      setLocalProgressMs(playback.progress_ms);
    }
  }, [playback?.progress_ms]);

  // Incrementa o progresso local a cada segundo se estiver tocando
  useEffect(() => {
    if (!playback?.is_playing || localProgressMs === null) return;

    const interval = setInterval(() => {
      setLocalProgressMs(prev => (prev !== null ? prev + 1000 : null));
    }, 1000);

    // Cleanup: Para o intervalo quando o componente desmonta ou o estado de reprodução muda
    return () => clearInterval(interval);
  }, [playback?.is_playing, localProgressMs]);

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
  
  const durationMs = nowPlaying.duration_ms;
  const currentMs = Math.min(localProgressMs ?? 0, durationMs);
  const progressPercent = (currentMs / durationMs) * 100;
  
  const totalTime = formatDuration(durationMs);
  const currentTime = formatDuration(currentMs);

  async function handleControlAction(action: () => Promise<void>) {
    try {
      setErrorFeedback(null);
      await action();
      // Refetch imediato para atualizar a UI
      queryClient.invalidateQueries({ queryKey: queryKeys.player });
      queryClient.invalidateQueries({ queryKey: queryKeys.queue });
    } catch (err) {
	  console.error('Player control error:', err);
    }
  }

  function togglePlay() {
    if (playback?.is_playing) {
      handleControlAction(pause);
    } else {
      handleControlAction(play);
    }
  }

  function handleNext() {
    handleControlAction(next);
  }

  function handlePrevious() {
    handleControlAction(previous);
  }

  function handleToggleShuffle() {
    handleControlAction(() => toggleShuffle(!playback.shuffle_state));
  }

  function handleToggleRepeat() {
    const nextMode = playback.repeat_state === 'off' ? 'context' : 
                     playback.repeat_state === 'context' ? 'track' : 'off';
    handleControlAction(() => setRepeatMode(nextMode));
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const targetMs = pct * durationMs;
    setLocalProgressMs(targetMs);
    handleControlAction(() => seek(targetMs));
  }

  return (
    <div className={styles.page}>
      {/* Feedback de Erro (Premium ou outros) */}
      {errorFeedback && (
        <div className={styles.errorBanner} onClick={() => setErrorFeedback(null)}>
          {errorFeedback} <span>✕</span>
        </div>
      )}

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

          {/* Barra de progresso com timestamps */}
          <div className={styles.progressSection}>
            <div
              className={styles.progressBar}
              onClick={handleProgressClick}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPercent)}
              tabIndex={0}
            >
              <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
              <div className={styles.progressThumb} style={{ left: `${progressPercent}%` }} />
            </div>
            <div className={styles.timeLabels}>
              <span className={styles.timestamp}>{currentTime}</span>
              <span className={styles.timestamp}>{totalTime}</span>
            </div>
          </div>

          {/* Controles de playback grandes */}
          <div className={styles.controls}>
            <button 
              className={`${styles.controlBtn} ${playback.shuffle_state ? styles.controlActive : ''}`} 
              onClick={handleToggleShuffle}
              aria-label="Ordem aleatória"
            >
              <Shuffle size={22} />
            </button>
            <button 
              className={styles.controlBtn} 
              onClick={handlePrevious}
              aria-label="Anterior"
            >
              <SkipBack size={28} fill="currentColor" strokeWidth={0} />
            </button>
            <button
              className={styles.playLargeBtn}
              onClick={togglePlay}
              aria-label={playback.is_playing ? 'Pausar' : 'Tocar'}
            >
              {playback.is_playing
                ? <Pause size={34} fill="currentColor" strokeWidth={0} />
                : <Play size={34} fill="currentColor" strokeWidth={0} />
              }
            </button>
            <button 
              className={styles.controlBtn} 
              onClick={handleNext}
              aria-label="Próxima"
            >
              <SkipForward size={28} fill="currentColor" strokeWidth={0} />
            </button>
            <button 
              className={`${styles.controlBtn} ${playback.repeat_state !== 'off' ? styles.controlActive : ''}`} 
              onClick={handleToggleRepeat}
              aria-label="Repetir"
            >
              <Repeat size={22} />
            </button>
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
