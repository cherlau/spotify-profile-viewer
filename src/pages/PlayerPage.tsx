import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Music, Mic2 } from 'lucide-react';
import { usePlaybackState } from '../hooks/usePlaybackState';
import { useQueue } from '../hooks/useQueue';
import { useProfile } from '../hooks/useProfile';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import { EqualizerLoader } from '../components/shared/EqualizerLoader';
import type { SpotifyTrack } from '../types/spotify';
import styles from './PlayerPage.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Faz o parse do formato LRC [mm:ss.xx] para milissegundos e texto.
 */
function parseLRC(lrc: string): { timeMs: number; text: string }[] {
  return lrc
    .split('\n')
    .map(line => {
      const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
      if (!match) return null;
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      return {
        timeMs: (minutes * 60 + seconds) * 1000,
        text
      };
    })
    .filter((line): line is { timeMs: number; text: string } => line !== null);
}

// ─── Custom Hooks ─────────────────────────────────────────────────────────────

interface LyricLine {
  timeMs: number;
  text: string;
}

/**
 * Busca as letras da track atual na API LRCLIB e faz o parse se disponíveis utilizando React Query para cache.
 */
function useLyrics(trackName: string | undefined, artistName: string | undefined) {
  const { data: lyrics = [], isLoading } = useQuery({
    queryKey: ['lyrics', trackName, artistName],
    queryFn: async () => {
      try {
        const query = new URLSearchParams({ 
          track_name: trackName!, 
          artist_name: artistName! 
        });
        const response = await fetch(`https://lrclib.net/api/get?${query}`);
        
        if (!response.ok) return [];
        
        const data = await response.json();
        return data.syncedLyrics ? parseLRC(data.syncedLyrics) : [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!trackName && !!artistName,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 1 hora
    refetchOnWindowFocus: false,
    retry: false,
  });

  return { lyrics, isLoading };
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
  const [localProgressMs, setLocalProgressMs] = useState(0);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLParagraphElement>(null);

  const { data: playback, isLoading, isError, refetch } = usePlaybackState({
    refetchInterval: isActive ? 4000 : false,
    enabled: isActive,
  });

  const { data: queueData } = useQueue({
    refetchInterval: isActive ? 4000 : false,
    enabled: isActive,
  });

  const nowPlaying = playback?.item;
  const artistName = nowPlaying?.artists[0]?.name;
  const trackName = nowPlaying?.name;

  const { lyrics, isLoading: isLoadingLyrics } = useLyrics(trackName, artistName);
  const { data: profile } = useProfile();

  // Sincroniza o relógio local com o Spotify sempre que o hook de playback atualizar
  useEffect(() => {
    if (playback?.progress_ms !== undefined) {
      setLocalProgressMs(playback.progress_ms || 0);
    }
  }, [playback?.progress_ms, playback?.timestamp]);

  // Cronômetro local para progresso fluido (500ms) quando a música está tocando
  useEffect(() => {
    if (!playback?.is_playing) return;

    const interval = setInterval(() => {
      setLocalProgressMs(prev => prev + 500);
    }, 500);

    return () => clearInterval(interval);
  }, [playback?.is_playing]);

  // Identifica a linha da letra ativa baseado no progresso local
  const currentLineIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    return lyrics.findLastIndex(line => line.timeMs <= localProgressMs);
  }, [lyrics, localProgressMs]);

  // Auto-scroll para manter a linha ativa centralizada no container de letras
  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeLine = activeLyricRef.current;
      
      const scrollTarget = activeLine.offsetTop - container.clientHeight / 2 + activeLine.clientHeight / 2;
      
      container.scrollTo({
        top: scrollTarget,
        behavior: 'smooth'
      });
    }
  }, [currentLineIndex]);

  useEffect(() => {
    setIsActive(true);
    return () => setIsActive(false);
  }, []);

  if (isLoading) return <LoadingState message="Conectando ao seu Spotify…" />;
  if (isError) return <ErrorState message="Não foi possível carregar o player." onRetry={refetch} />;

  if (profile && profile.product !== 'premium') {
    return (
      <div className={styles.empty}>
        <Music size={48} strokeWidth={1.5} />
        <p>O Player requer uma conta Spotify Premium.</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
          Infelizmente, o Spotify limita o uso do SDK de reprodução apenas para usuários Premium.
        </p>
      </div>
    );
  }

  if (!playback || !nowPlaying) {
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

  const queue: SpotifyTrack[] = queueData?.queue?.slice(0, 4) ?? [];
  const imageUrl = nowPlaying.album.images?.[0]?.url ?? null;
  const artistNames = nowPlaying.artists.map(a => a.name).join(', ');
  const albumName = nowPlaying.album.name;

  return (
    <div className={styles.page}>
      {imageUrl && (
        <div
          className={styles.bgBlur}
          style={{ backgroundImage: `url(${imageUrl})` }}
          aria-hidden="true"
        />
      )}

      <div className={styles.layout}>
        <div className={styles.playerArea}>
          <div className={styles.albumArtWrapper}>
            {imageUrl ? (
              <img src={imageUrl} alt={albumName} className={styles.albumArt} />
            ) : (
              <div className={styles.albumArtPlaceholder}>
                <Music size={80} strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className={styles.trackInfo}>
            <span className={styles.trackLabel}>{albumName}</span>
            <h1 className={styles.trackTitle}>{nowPlaying.name}</h1>
            <p className={styles.trackArtist}>
              {artistNames}
              <span className={styles.trackDot}> • </span>
              {albumName}
            </p>
          </div>

          <section className={styles.lyricsSection}>
            <div 
              className={styles.lyricsContent} 
              ref={lyricsContainerRef}
            >
              {isLoadingLyrics ? (
                <div className={styles.lyricsPlaceholder}>
                  <EqualizerLoader />
                </div>
              ) : lyrics.length > 0 ? (
                <div className={styles.lyricsList}>
                  {lyrics.map((line, index) => {
                    const isActiveLine = index === currentLineIndex;
                    return (
                      <p
                        key={`${line.timeMs}-${index}`}
                        ref={isActiveLine ? activeLyricRef : null}
                        className={`${styles.lyricLine} ${isActiveLine ? styles.activeLyricLine : ''}`}
                      >
                        {line.text}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.lyricsPlaceholder}>
                  Letras sincronizadas não encontradas para esta faixa.
                </p>
              )}
            </div>
          </section>

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

        <aside className={styles.desktopSidebar}>
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
