import { Play } from 'lucide-react';
import styles from './ArtistCard.module.css';

interface ArtistCardProps {
  name: string;
  imageUrl: string | null;
  genres: string[];
  spotifyUrl: string;
}

export function ArtistCard({ name, imageUrl, genres, spotifyUrl }: ArtistCardProps) {
  const genre = genres?.[0] ?? 'Artista';

  return (
    <a
      href={spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      aria-label={name}
    >
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className={styles.image}
            draggable={false}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden="true" />
        )}
        {/* Overlay com ícone play (visível no hover via CSS) */}
        <div className={styles.overlay} aria-hidden="true">
          <Play size={30} fill="currentColor" className={styles.playIcon} />
        </div>
      </div>

      <p className={styles.name}>{name}</p>
      {/* Mobile: label fixo "Artist" | Desktop: primeiro gênero */}
      <p className={styles.label}>{genre}</p>
    </a>
  );
}
