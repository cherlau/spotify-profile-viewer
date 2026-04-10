import { useState } from 'react';
import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Heart,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import styles from './PlayerBar.module.css';

interface PlayerBarProps {
  /** Dados da faixa em reprodução. Null quando nada está tocando. */
  track?: {
    name: string;
    artistName: string;
    albumImageUrl: string | null;
    durationMs: number;
  } | null;
}

/** Converte milissegundos em "m:ss" */
function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

/** Dados mockados enquanto a integração de playback não existe */
const MOCK_TRACK = {
  name: 'Midnight City',
  artistName: 'M83',
  albumImageUrl: null,
  durationMs: 243000, // 4:03
};

export function PlayerBar({ track = MOCK_TRACK }: PlayerBarProps) {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(30); // 0–100 (percentual)

  const currentMs = track ? Math.round((progress / 100) * track.durationMs) : 0;

  if (!track) return null;

  return isDesktop ? (
    /* ── Desktop: barra full-width no rodapé ────────────────────── */
    <div className={styles.playerDesktop}>
      {/* Esquerda: info da faixa */}
      <div className={styles.trackInfo}>
        <div className={styles.albumThumb}>
          {track.albumImageUrl ? (
            <img src={track.albumImageUrl} alt={track.name} className={styles.albumImg} />
          ) : (
            <div className={styles.albumPlaceholder} />
          )}
        </div>
        <div className={styles.trackMeta}>
          <span className={styles.trackName}>{track.name}</span>
          <span className={styles.artistName}>{track.artistName}</span>
        </div>
        <button
          className={`${styles.iconBtn} ${isLiked ? styles.iconBtnActive : ''}`}
          onClick={() => setIsLiked(l => !l)}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Centro: controles + progress bar */}
      <div className={styles.controls}>
        <div className={styles.controlButtons}>
          <button
            className={`${styles.iconBtn} ${isShuffle ? styles.iconBtnActive : ''}`}
            onClick={() => setIsShuffle(s => !s)}
            aria-label="Shuffle"
          >
            <Shuffle size={16} />
          </button>
          <button className={styles.iconBtn} aria-label="Previous">
            <SkipBack size={18} />
          </button>
          <button
            className={styles.playBtn}
            onClick={() => setIsPlaying(p => !p)}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <button className={styles.iconBtn} aria-label="Next">
            <SkipForward size={18} />
          </button>
          <button
            className={`${styles.iconBtn} ${isRepeat ? styles.iconBtnActive : ''}`}
            onClick={() => setIsRepeat(r => !r)}
            aria-label="Repeat"
          >
            <Repeat size={16} />
          </button>
        </div>

        {/* Barra de progresso */}
        <div className={styles.progressRow}>
          <span className={styles.timestamp}>{formatTime(currentMs)}</span>
          <div
            className={styles.progressTrack}
            role="slider"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setProgress(Math.round(((e.clientX - rect.left) / rect.width) * 100));
            }}
          >
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            <div className={styles.progressThumb} style={{ left: `${progress}%` }} />
          </div>
          <span className={styles.timestamp}>{formatTime(track.durationMs)}</span>
        </div>
      </div>

      {/* Direita: volume */}
      <div className={styles.volumeControls}>
        <button
          className={styles.iconBtn}
          onClick={() => setIsMuted(m => !m)}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <div
          className={styles.volumeTrack}
          role="slider"
          aria-valuenow={isMuted ? 0 : volume}
          aria-valuemin={0}
          aria-valuemax={100}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const newVol = Math.round(((e.clientX - rect.left) / rect.width) * 100);
            setVolume(newVol);
            setIsMuted(false);
          }}
        >
          <div
            className={styles.volumeFill}
            style={{ width: `${isMuted ? 0 : volume}%` }}
          />
        </div>
      </div>
    </div>
  ) : (
    /* ── Mobile: pill flutuante (clicável → abre PlayerPage) ───── */
    <div
      className={styles.playerMobile}
      onClick={() => navigate('/player')}
      role="button"
      tabIndex={0}
      aria-label="Open player"
      onKeyDown={e => e.key === 'Enter' && navigate('/player')}
    >
      {/* Album art mini */}
      <div className={styles.albumThumbMobile}>
        {track.albumImageUrl ? (
          <img src={track.albumImageUrl} alt={track.name} className={styles.albumImg} />
        ) : (
          <div className={styles.albumPlaceholder} />
        )}
      </div>

      {/* Nome + artista */}
      <div className={styles.trackMetaMobile}>
        <span className={styles.trackName}>{track.name}</span>
        <span className={styles.artistName}>{track.artistName}</span>
      </div>

      {/* Controles compactos — stopPropagation para não acionar o navigate do pill */}
      <div className={styles.mobileControls} onClick={e => e.stopPropagation()}>
        <button
          className={`${styles.iconBtn} ${isShuffle ? styles.iconBtnActive : ''}`}
          onClick={() => setIsShuffle(s => !s)}
          aria-label="Shuffle"
        >
          <Shuffle size={16} />
        </button>
        <button className={styles.iconBtn} aria-label="Previous">
          <SkipBack size={16} />
        </button>
        <button
          className={styles.playBtnMobile}
          onClick={() => setIsPlaying(p => !p)}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
        <button className={styles.iconBtn} aria-label="Next">
          <SkipForward size={16} />
        </button>
        <button
          className={`${styles.iconBtn} ${isRepeat ? styles.iconBtnActive : ''}`}
          onClick={() => setIsRepeat(r => !r)}
          aria-label="Repeat"
        >
          <Repeat size={16} />
        </button>
      </div>
    </div>
  );
}
