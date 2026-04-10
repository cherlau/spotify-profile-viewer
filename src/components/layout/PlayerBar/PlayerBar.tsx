import styles from './PlayerBar.module.css';

export function PlayerBar() {
  return (
    <div className={styles.playerDesktop}>
      <iframe
        title="Spotify Player"
        src="https://open.spotify.com/embed/playlist/2cdTXqcjfyGIHBtwDIlk8P?utm_source=generator&theme=0"
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ borderRadius: '20px', display: 'block', marginBottom: '-3px' }}
      />
    </div>
  );
}
