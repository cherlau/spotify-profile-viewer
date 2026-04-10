import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Heart, MoreHorizontal, Music, Mic2, Disc3, Radio } from 'lucide-react';
import { useRecentlyPlayed } from '../hooks/useRecentlyPlayed';
import { useFollowedArtists } from '../hooks/useFollowedArtists';
import { useSavedAlbums } from '../hooks/useSavedAlbums';
import { useSavedShows } from '../hooks/useSavedShows';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import type { SpotifyTrack, SpotifyArtist, SpotifyAlbum, SpotifyShow } from '../types/spotify';
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

/** Verifica se um texto contém a query (case-insensitive). Retorna false se text for nulo/undefined. */
function matches(text: string | null | undefined, q: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(q.toLowerCase());
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
        <button className={styles.actionBtn} aria-label="More options">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}

function ShowRow({ show }: { show: SpotifyShow }) {
  const imageUrl = show.images?.[0]?.url ?? null;

  return (
    <div className={styles.trackItem}>
      <div className={`${styles.trackArtWrapper} ${styles.artistArtWrapper}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={show.name} className={styles.trackArt} />
        ) : (
          <div className={styles.trackArtPlaceholder}>
            <Radio size={20} />
          </div>
        )}
      </div>
      <div className={styles.trackMeta}>
        <span className={styles.trackName}>{show.name}</span>
        <span className={styles.trackSub}>
          {show.publisher}
          {show.total_episodes != null && (
            <><span className={styles.trackDot}> • </span>{show.total_episodes} episodes</>
          )}
        </span>
      </div>
      <div className={styles.trackActions}>
        <button className={styles.actionBtn} aria-label="More options">
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
        <button className={styles.actionBtn} aria-label="More options">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
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
  const [searchParams] = useSearchParams();

  // Query de busca vinda da URL (preenchida pelo AppHeader)
  const searchQuery = searchParams.get('q')?.trim() ?? '';

  const { data: recentData, isLoading: recentLoading, isError: recentError, refetch: refetchRecent } = useRecentlyPlayed(50);
  const { data: artistsData, isLoading: artistsLoading, isError: artistsError, refetch: refetchArtists } = useFollowedArtists(50);
  const { data: albumsData, isLoading: albumsLoading, isError: albumsError, refetch: refetchAlbums } = useSavedAlbums(50);
  const { data: showsData, isLoading: showsLoading, isError: showsError, refetch: refetchShows } = useSavedShows(50);

  const rawTracks = (recentData?.items ?? []).map(item => item.track);
  const tracks = deduplicateTracks(rawTracks);
  const artists = artistsData?.artists.items ?? [];
  const albums = albumsData?.items.map(i => i.album) ?? [];
  const shows = showsData?.items.map(i => i.show) ?? [];

  // Resultados filtrados pela query — busca em nome, artistas e gênero
  const filteredTracks = searchQuery
    ? tracks.filter(t =>
        matches(t.name, searchQuery) ||
        t.artists.some(a => matches(a.name, searchQuery)) ||
        matches(t.album.name, searchQuery)
      )
    : tracks;

  const filteredArtists = searchQuery
    ? artists.filter(a =>
        matches(a.name, searchQuery) ||
        (a.genres ?? []).some(g => matches(g, searchQuery))
      )
    : artists;

  const filteredAlbums = searchQuery
    ? albums.filter(a =>
        matches(a.name, searchQuery) ||
        a.artists.some(ar => matches(ar.name, searchQuery))
      )
    : albums;

  const filteredShows = searchQuery
    ? shows.filter(s =>
        matches(s.name, searchQuery) ||
        matches(s.publisher, searchQuery)
      )
    : shows;

  const isAnyLoading = recentLoading || artistsLoading || albumsLoading || showsLoading;
  const totalResults = filteredTracks.length + filteredArtists.length + filteredAlbums.length + filteredShows.length;

  return (
    <div className={styles.page}>
      {/* Header editorial */}
      <header className={styles.header}>
        <span className={styles.headerLabel}>Your Collection</span>
        <h1 className={styles.headerTitle}>
          {searchQuery ? `"${searchQuery}"` : 'Your Library'}
        </h1>
        <p className={styles.headerDesc}>
          {searchQuery
            ? `${totalResults} result${totalResults !== 1 ? 's' : ''} across music, artists, albums and podcasts`
            : 'Everything you\'ve saved, played, and loved — all in one place.'}
        </p>
      </header>

      {searchQuery ? (
        /* ── Modo de busca: resultados agrupados por categoria ─────── */
        <div>
          {isAnyLoading && <LoadingState message="Searching…" />}

          {!isAnyLoading && totalResults === 0 && (
            <p className={styles.empty}>No results found for "{searchQuery}".</p>
          )}

          {filteredTracks.length > 0 && (
            <section className={styles.tracksSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Music</h2>
                <span className={styles.resultCount}>{filteredTracks.length}</span>
              </div>
              <div className={styles.trackList}>
                {filteredTracks.map(track => (
                  <TrackRow key={track.id} track={track} />
                ))}
              </div>
            </section>
          )}

          {filteredArtists.length > 0 && (
            <section className={styles.tracksSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Artists</h2>
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
                <h2 className={styles.sectionTitle}>Albums</h2>
                <span className={styles.resultCount}>{filteredAlbums.length}</span>
              </div>
              <div className={styles.trackList}>
                {filteredAlbums.map(album => (
                  <AlbumRow key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}

          {filteredShows.length > 0 && (
            <section className={styles.tracksSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Podcasts</h2>
                <span className={styles.resultCount}>{filteredShows.length}</span>
              </div>
              <div className={styles.trackList}>
                {filteredShows.map(show => (
                  <ShowRow key={show.id} show={show} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* ── Modo normal: tabs por categoria ───────────────────────── */
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
                <h2 className={styles.sectionTitle}>Recently Played</h2>
                <button className={styles.seeAll}>SEE ALL</button>
              </div>
              {recentLoading ? (
                <LoadingState message="Loading tracks…" />
              ) : recentError ? (
                <ErrorState message="Could not load recently played tracks." onRetry={refetchRecent} />
              ) : tracks.length === 0 ? (
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

          {/* Aba Artists — Artistas seguidos (GET /me/following) */}
          {activeTab === 'artists' && (
            <section className={styles.tracksSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Following</h2>
              </div>
              {artistsLoading ? (
                <LoadingState message="Loading artists…" />
              ) : artistsError ? (
                <ErrorState message="Could not load followed artists." onRetry={refetchArtists} />
              ) : artists.length === 0 ? (
                <p className={styles.empty}>No followed artists yet.</p>
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
                <h2 className={styles.sectionTitle}>Saved Albums</h2>
              </div>
              {albumsLoading ? (
                <LoadingState message="Loading albums…" />
              ) : albumsError ? (
                <ErrorState message="Could not load saved albums." onRetry={refetchAlbums} />
              ) : albums.length === 0 ? (
                <p className={styles.empty}>No saved albums yet.</p>
              ) : (
                <div className={styles.trackList}>
                  {albums.map(album => (
                    <AlbumRow key={album.id} album={album} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Aba Podcasts — GET /me/shows */}
          {activeTab === 'podcasts' && (
            <section className={styles.tracksSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Your Podcasts</h2>
              </div>
              {showsLoading ? (
                <LoadingState message="Loading podcasts…" />
              ) : showsError ? (
                <ErrorState message="Could not load your podcasts." onRetry={refetchShows} />
              ) : shows.length === 0 ? (
                <p className={styles.empty}>No podcasts in your library yet.</p>
              ) : (
                <div className={styles.trackList}>
                  {shows.map(show => (
                    <ShowRow key={show.id} show={show} />
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
