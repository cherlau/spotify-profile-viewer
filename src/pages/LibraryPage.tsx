import { useState, useMemo, useDeferredValue } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Heart, MoreHorizontal, Music, Mic2, Disc3 } from 'lucide-react';
import { useRecentlyPlayed } from '../hooks/useRecentlyPlayed';
import { useFollowedArtists } from '../hooks/useFollowedArtists';
import { useSavedAlbums } from '../hooks/useSavedAlbums';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import { usePlayer } from '../contexts/PlayerContext';
import type { SpotifyTrack, SpotifyArtist, SpotifyAlbum } from '../types/spotify';
import styles from './LibraryPage.module.css';

type Tab = 'music' | 'albums' | 'artists';

const TABS: { key: Tab; label: string }[] = [
  { key: 'music', label: 'Música' },
  { key: 'artists', label: 'Artistas' },
  { key: 'albums', label: 'Álbuns' }
];

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function deduplicateTracks(tracks: SpotifyTrack[]): SpotifyTrack[] {
  const seen = new Set<string>();
  return tracks.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

// A query já deve vir em minúsculas para evitar toLowerCase() repetitivo.
function matches(text: string | null | undefined, lowerQuery: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(lowerQuery);
}

function AlbumRow({ album }: { album: SpotifyAlbum }) {
  const imageUrl = album.images?.[0]?.url ?? null;
  const artistNames = album.artists.map(a => a.name).join(', ');
  const year = album.release_date?.slice(0, 4) ?? '';

  return (
    <div className={styles.trackItem}>
      <div className={styles.trackArtWrapper}>
        {imageUrl ? (
          <img src={imageUrl} alt={album.name} className={styles.trackArt} />
        ) : (
          <div className={styles.trackArtPlaceholder}>
            <Disc3 size={20} />
          </div>
        )}
      </div>
      <div className={styles.trackMeta}>
        <span className={styles.trackName}>{album.name}</span>
        <span className={styles.trackSub}>
          {artistNames}
          {year && <><span className={styles.trackDot}> • </span>{year}</>}
        </span>
      </div>
      <div className={styles.trackActions}>
        <button className={styles.actionBtn} aria-label="Mais opções">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}

function ArtistRow({ artist }: { artist: SpotifyArtist }) {
  const imageUrl = artist.images?.[0]?.url ?? null;
  const genres = (artist.genres ?? []).slice(0, 2).join(', ');

  return (
    <div className={styles.trackItem}>
      <div className={`${styles.trackArtWrapper} ${styles.artistArtWrapper}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={artist.name} className={styles.trackArt} />
        ) : (
          <div className={styles.trackArtPlaceholder}>
            <Mic2 size={20} />
          </div>
        )}
      </div>
      <div className={styles.trackMeta}>
        <span className={styles.trackName}>{artist.name}</span>
        {genres && <span className={styles.trackSub}>{genres}</span>}
      </div>
      <div className={styles.trackActions}>
        <button className={styles.actionBtn} aria-label="Mais opções">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}

interface TrackRowProps {
  track: SpotifyTrack;
  onPlay: () => void;
}

function TrackRow({ track, onPlay }: TrackRowProps) { 
  const [hovered, setHovered] = useState(false);
  const { playbackState } = usePlayer();
  const imageUrl = track.album.images?.[0]?.url ?? null;
  const artistNames = track.artists.map(a => a.name).join(', ');
  const duration = formatDuration(track.duration_ms);

  const isCurrentTrack = playbackState?.item?.id === track.id;
  const isPlaying = isCurrentTrack && playbackState?.is_playing;

  return (
    <div
      className={`${styles.trackItem} ${isCurrentTrack ? styles.trackItemActive : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.trackArtWrapper}>
        {imageUrl ? (
          <img src={imageUrl} alt={track.album.name} className={styles.trackArt} />
        ) : (
          <div className={styles.trackArtPlaceholder}>
            <Music size={20} />
          </div>
        )}
        
        {isPlaying ? (
          <div className={styles.playOverlay} style={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="playing-wave">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : (
          hovered && (
            <div className={styles.playOverlay}>
              <button 
                className={styles.playBtn} 
                aria-label={`Tocar ${track.name}`}
                onClick={onPlay}
              >
                <Play size={16} fill="currentColor" />
              </button>
            </div>
          )
        )}
      </div>

      <div className={styles.trackMeta}>
        <span className={`${styles.trackName} ${isCurrentTrack ? styles.trackNameActive : ''}`}>
          {track.name}
        </span>
        <span className={styles.trackSub}>
          {artistNames}
          <span className={styles.trackDot}> • </span>
          <span className={styles.trackDuration}>{duration}</span>
        </span>
      </div>

      <div className={styles.trackActions}>
        <button className={styles.actionBtn} aria-label="Curtir">
          <Heart size={18} color={isCurrentTrack ? '#1db954' : 'currentColor'} fill={isCurrentTrack ? '#1db954' : 'none'} />
        </button>
        <button className={styles.actionBtn} aria-label="Mais opções">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('music');
  const [searchParams] = useSearchParams();
  const { playTrack } = usePlayer();

  // Query de busca vinda da URL (preenchida pelo AppHeader)
  const searchQuery = searchParams.get('q')?.trim() ?? '';
  
  // Prioriza a responsividade do input, processando os resultados em background
  const deferredQuery = useDeferredValue(searchQuery);

  const { data: recentData, isLoading: recentLoading, isError: recentError, refetch: refetchRecent } = useRecentlyPlayed(50);
  const { data: artistsData, isLoading: artistsLoading, isError: artistsError, refetch: refetchArtists } = useFollowedArtists(50);
  const { data: albumsData, isLoading: albumsLoading, isError: albumsError, refetch: refetchAlbums } = useSavedAlbums(50);

  const tracks = useMemo(() => {
    const rawTracks = (recentData?.items ?? []).map(item => item.track);
    return deduplicateTracks(rawTracks);
  }, [recentData]);

  const artists = useMemo(() => artistsData?.artists.items ?? [], [artistsData]);
  const albums = useMemo(() => albumsData?.items.map(i => i.album) ?? [], [albumsData]);

  const lowerQuery = useMemo(() => deferredQuery.toLowerCase(), [deferredQuery]);

  const filteredTracks = useMemo(() => 
    deferredQuery
      ? tracks.filter(t =>
          matches(t.name, lowerQuery) ||
          t.artists.some(a => matches(a.name, lowerQuery)) ||
          matches(t.album.name, lowerQuery)
        )
      : tracks,
    [tracks, lowerQuery, deferredQuery]
  );

  const filteredArtists = useMemo(() => 
    deferredQuery
      ? artists.filter(a =>
          matches(a.name, lowerQuery) ||
          (a.genres ?? []).some(g => matches(g, lowerQuery))
        )
      : artists,
    [artists, lowerQuery, deferredQuery]
  );

  const filteredAlbums = useMemo(() => 
    deferredQuery
      ? albums.filter(a =>
          matches(a.name, lowerQuery) ||
          a.artists.some(ar => matches(ar.name, lowerQuery))
        )
      : albums,
    [albums, lowerQuery, deferredQuery]
  );

  const handlePlayFromList = (list: SpotifyTrack[], startIndex: number) => {
    const uris = list.slice(startIndex).map(t => t.uri);
    playTrack(uris, list[startIndex]);
  };

  const isAnyLoading = recentLoading || artistsLoading || albumsLoading;
  const totalResults = filteredTracks.length + filteredArtists.length + filteredAlbums.length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.headerLabel}>Sua Coleção</span>
        <h1 className={styles.headerTitle}>
          {searchQuery ? `"${searchQuery}"` : 'Biblioteca'}
        </h1>
        <p className={styles.headerDesc}>
          {searchQuery
            ? `${totalResults} resultado${totalResults !== 1 ? 's' : ''} em músicas, artistas, álbuns e podcasts`
            : 'Tudo o que você salvou, ouviu e amou, tudo em um só lugar.'}
        </p>
      </header>

      {searchQuery ? (
        <div>
          {isAnyLoading && <LoadingState message="Buscando…" />}

          {!isAnyLoading && totalResults === 0 && (
            <p className={styles.empty}>Nenhum resultado encontrado para "{searchQuery}".</p>
          )}

          {filteredTracks.length > 0 && (
            <section className={styles.tracksSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Música</h2>
                <span className={styles.resultCount}>{filteredTracks.length}</span>
              </div>
              <div className={styles.trackList}>
                {filteredTracks.map((track, index) => (
                  <TrackRow 
                    key={track.id} 
                    track={track} 
                    onPlay={() => handlePlayFromList(filteredTracks, index)}
                  />
                ))}
              </div>
            </section>
          )}

          {filteredArtists.length > 0 && (
            <section className={styles.tracksSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Artistas</h2>
                <span className={styles.resultCount}>{filteredArtists.length}</span>
              </div>
              <div className={styles.trackList}>
                {filteredArtists.map(artist => (
                  <ArtistRow key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {filteredAlbums.length > 0 && (
            <section className={styles.tracksSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Álbuns</h2>
                <span className={styles.resultCount}>{filteredAlbums.length}</span>
              </div>
              <div className={styles.trackList}>
                {filteredAlbums.map(album => (
                  <AlbumRow key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <>
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

          {/* Aba Music — Recently Played */}
          {activeTab === 'music' && (
            <section className={styles.tracksSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Tocadas recentemente</h2>
                <button className={styles.seeAll}>VER TUDO</button>
              </div>
              {recentLoading ? (
                <LoadingState/>
              ) : recentError ? (
                <ErrorState message="Não foi possível carregar as músicas tocadas recentemente." onRetry={refetchRecent} />
              ) : tracks.length === 0 ? (
                <p className={styles.empty}>Nenhuma música encontrada.</p>
              ) : (
                <div className={styles.trackList}>
                  {tracks.slice(0, 20).map((track, index) => (
                    <TrackRow 
                      key={track.id} 
                      track={track} 
                      onPlay={() => handlePlayFromList(tracks.slice(0, 20), index)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Aba Artists — Artistas seguidos (GET /me/following) */}
          {activeTab === 'artists' && (
            <section className={styles.tracksSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Seguindo</h2>
              </div>
              {artistsLoading ? (
                <LoadingState/>
              ) : artistsError ? (
                <ErrorState message="Não foi possível carregar os artistas seguidos." onRetry={refetchArtists} />
              ) : artists.length === 0 ? (
                <p className={styles.empty}>Nenhum artista seguido ainda.</p>
              ) : (
                <div className={styles.trackList}>
                  {artists.map(artist => (
                    <ArtistRow key={artist.id} artist={artist} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Aba Albums — GET /me/albums */}
          {activeTab === 'albums' && (
            <section className={styles.tracksSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Álbuns salvos</h2>
              </div>
              {albumsLoading ? (
                <LoadingState/>
              ) : albumsError ? (
                <ErrorState message="Não foi possível carregar os álbuns salvos." onRetry={refetchAlbums} />
              ) : albums.length === 0 ? (
                <p className={styles.empty}>Nenhum álbum salvo ainda.</p>
              ) : (
                <div className={styles.trackList}>
                  {albums.map(album => (
                    <AlbumRow key={album.id} album={album} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
