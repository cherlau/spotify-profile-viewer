import type { SpotifyArtist } from '../../../types/spotify';
import { ArtistCard } from '../ArtistCard';
import { LoadingState } from '../../shared/LoadingState';
import styles from './TopArtistsSection.module.css';

interface TopArtistsSectionProps {
  artists: SpotifyArtist[];
}

/* Desktop mostra 4 artistas em grid; mobile mostra todos em scroll horizontal */
const DESKTOP_LIMIT = 4;

export function TopArtistsSection({ artists }: TopArtistsSectionProps) {
  if (artists.length === 0) {
    return null;
  }

  const desktopArtists = artists.slice(0, DESKTOP_LIMIT);

  return (
    <section className={styles.section} aria-label="Artistas favoritos">
      {/* ── Header Mobile ── */}
      <div className={styles.headerMobile}>
        <div className={styles.headerText}>
          <h2 className={styles.titleMobile}>Seus artistas favoritos</h2>
          <p className={styles.subtitle}>Com base no que você ouviu recentemente</p>
        </div>
        <a
          href="https://open.spotify.com/collection/artists"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.seeAllLink}
        >
          VER TUDO
        </a>
      </div>

      {/* ── Header Desktop ── */}
      <div className={styles.headerDesktop}>
        <h2 className={styles.titleDesktop}>Artistas</h2>
        <a
          href="https://open.spotify.com/collection/artists"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.showAllLink}
        >
          Ver tudo
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
