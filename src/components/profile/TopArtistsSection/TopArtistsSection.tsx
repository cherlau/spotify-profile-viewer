import type { SpotifyArtist } from '../../../types/spotify';
import { ArtistCard } from '../ArtistCard';
import { LoadingState } from '../../shared/LoadingState';
import styles from './TopArtistsSection.module.css';

interface TopArtistsSectionProps {
  artists: SpotifyArtist[];
  isLoading: boolean;
}

/* Desktop mostra 4 artistas em grid; mobile mostra todos em scroll horizontal */
const DESKTOP_LIMIT = 4;

export function TopArtistsSection({ artists, isLoading }: TopArtistsSectionProps) {
  if (isLoading) {
    return <LoadingState message="Loading top artists…" />;
  }

  if (artists.length === 0) {
    return null;
  }

  const desktopArtists = artists.slice(0, DESKTOP_LIMIT);

  return (
    <section className={styles.section} aria-label="Top Artists">
      {/* ── Header Mobile ── */}
      <div className={styles.headerMobile}>
        <div className={styles.headerText}>
          <h2 className={styles.titleMobile}>Your Top Artists</h2>
          <p className={styles.subtitle}>Based on your recent playback</p>
        </div>
        <a
          href="https://open.spotify.com/collection/artists"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.seeAllLink}
        >
          SEE ALL
        </a>
      </div>

      {/* ── Header Desktop ── */}
      <div className={styles.headerDesktop}>
        <h2 className={styles.titleDesktop}>Top Artists</h2>
        <a
          href="https://open.spotify.com/collection/artists"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.showAllLink}
        >
          See All
        </a>
      </div>

      {/* ── Grid Mobile: scroll horizontal (todos os artistas) ── */}
      <div className={styles.scrollContainer} role="list">
        {artists.map((artist) => (
          <div key={artist.id} role="listitem">
            <ArtistCard
              name={artist.name}
              imageUrl={artist.images?.[0]?.url ?? null}
              genres={artist.genres ?? []}
              spotifyUrl={artist.external_urls.spotify}
            />
          </div>
        ))}
      </div>

      {/* ── Grid Desktop: 4 colunas ── */}
      <div className={styles.gridDesktop} role="list">
        {desktopArtists.map((artist) => (
          <div key={artist.id} role="listitem">
            <ArtistCard
              name={artist.name}
              imageUrl={artist.images?.[0]?.url ?? null}
              genres={artist.genres ?? []}
              spotifyUrl={artist.external_urls.spotify}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
