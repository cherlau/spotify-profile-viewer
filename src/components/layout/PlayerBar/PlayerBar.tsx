import { useState, useEffect } from 'react';
import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { usePlayer } from '../../../contexts/PlayerContext';
import styles from './PlayerBar.module.css';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function PlayerBar() {
  const isDesktop = useIsDesktop();
  const {
    playbackState,
    optimisticTrack,
    isPlaying,
    togglePlay,
    next,
    previous,
    setVolume: updateSpotifyVolume,
    toggleShuffle,
    setRepeatMode
  } = usePlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [localVolume, setLocalVolume] = useState(70);
  
  useEffect(() => {
    if (playbackState?.device?.volume_percent !== undefined) {
      setLocalVolume(playbackState.device.volume_percent);
    }
  }, [playbackState?.device?.volume_percent]);

  // Mostra o player imediatamente com a track otimista enquanto o playbackState não sincroniza
  const track = playbackState?.item ?? optimisticTrack;
  if (!track) return null;
  const progressMs = playbackState?.progress_ms ?? 0;
  const durationMs = track.duration_ms;
  const progressPercent = (progressMs / durationMs) * 100;

  const handleVolumeChange = (newVol: number) => {
    setLocalVolume(newVol);
    updateSpotifyVolume(newVol);
    setIsMuted(false);
  };

  return isDesktop ? (
    <div className={styles.playerDesktop}>
      <div className={styles.trackInfo}>
        <div className={styles.albumThumb}>
          {track.album.images?.[0]?.url ? (
            <img src={track.album.images[0].url} alt={track.name} className={styles.albumImg} />
          ) : (
            <div className={styles.albumPlaceholder} />
          )}
        </div>
        <div className={styles.trackMeta}>
          <span className={styles.trackName}>{track.name}</span>
          <span className={styles.artistName}>{track.artists.map(a => a.name).join(', ')}</span>
        </div>
        <button
          className={`${styles.iconBtn} ${isLiked ? styles.iconBtnActive : ''}`}
          onClick={() => setIsLiked(l => !l)}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlButtons}>
          <button
            className={`${styles.iconBtn} ${playbackState?.shuffle_state ? styles.iconBtnActive : ''}`}
            onClick={toggleShuffle}
            aria-label="Shuffle"
          >
            <Shuffle size={16} />
          </button>
          <button className={styles.iconBtn} onClick={previous} aria-label="Previous">
            <SkipBack size={18} />
          </button>
          <button
            className={styles.playBtn}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <button className={styles.iconBtn} onClick={next} aria-label="Next">
            <SkipForward size={18} />
          </button>
          <button
            className={`${styles.iconBtn} ${playbackState?.repeat_state !== 'off' ? styles.iconBtnActive : ''}`}
            onClick={setRepeatMode}
            aria-label="Repeat"
          >
            {playbackState?.repeat_state === 'track' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>

        <div className={styles.progressRow}>
          <span className={styles.timestamp}>{formatTime(progressMs)}</span>
          <div
            className={styles.progressTrack}
            role="slider"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
            <div className={styles.progressThumb} style={{ left: `${progressPercent}%` }} />
          </div>
          <span className={styles.timestamp}>{formatTime(durationMs)}</span>
        </div>
      </div>

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
          aria-valuenow={isMuted ? 0 : localVolume}
          aria-valuemin={0}
          aria-valuemax={100}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const newVol = Math.round(((e.clientX - rect.left) / rect.width) * 100);
            handleVolumeChange(newVol);
          }}
        >
          <div
            className={styles.volumeFill}
            style={{ width: `${isMuted ? 0 : localVolume}%` }}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className={styles.playerMobile}>
      <div className={styles.albumThumbMobile}>
        {track.album.images?.[0]?.url ? (
          <img src={track.album.images[0].url} alt={track.name} className={styles.albumImg} />
        ) : (
          <div className={styles.albumPlaceholder} />
        )}
      </div>

      <div className={styles.trackMetaMobile}>
        <span className={styles.trackName}>{track.name}</span>
        <span className={styles.artistName}>{track.artists.map(a => a.name).join(', ')}</span>
      </div>

      <div className={styles.mobileControls}>
        <button className={styles.iconBtn} onClick={previous} aria-label="Previous">
          <SkipBack size={16} />
        </button>
        <button
          className={styles.playBtnMobile}
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
        <button className={styles.iconBtn} onClick={next} aria-label="Next">
          <SkipForward size={16} />
        </button>
      </div>
    </div>
  );
}
