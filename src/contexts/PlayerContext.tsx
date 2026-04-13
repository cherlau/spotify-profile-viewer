import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { usePlaybackState } from '../hooks/usePlaybackState';
import { useProfile } from '../hooks/useProfile';
import * as playerApi from '../api/player';
import type { SpotifyPlaybackState, SpotifyTrack } from '../types/spotify';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

interface PlayerContextType {
  playbackState: SpotifyPlaybackState | null;
  isLoading: boolean;
  isPlaying: boolean;
  deviceId: string | null;
  optimisticTrack: SpotifyTrack | null;
  playTrack: (trackUri: string | string[], track?: SpotifyTrack) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setVolume: (volumePercent: number) => Promise<void>;
  toggleShuffle: () => Promise<void>;
  setRepeatMode: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useSpotifyAuth();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [optimisticPlaying, setOptimisticPlaying] = useState<boolean | null>(null);
  const [optimisticTrack, setOptimisticTrack] = useState<SpotifyTrack | null>(null);
  const tokenRef = useRef<string | null>(token);

  // Mantém o ref atualizado para o callback getOAuthToken
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const { data: profile } = useProfile();
  const isPremium = profile?.product === 'premium';

  // Polling a cada 5 segundos — somente para usuários Premium
  const { data: playbackState, isLoading, refetch } = usePlaybackState({
    enabled: isAuthenticated && isPremium,
    refetchInterval: isPremium ? 5000 : false,
  });

  // Sincroniza os estados otimistas com o real quando a API responde
  useEffect(() => {
    if (playbackState !== undefined) {
      setOptimisticPlaying(null);
      // Limpa a track otimista assim que o playbackState reflete a música correta
      if (playbackState?.item) {
        setOptimisticTrack(null);
      }
    }
  }, [playbackState]);

  // Inicialização do Web Playback SDK — somente para usuários Premium
  useEffect(() => {
    if (!token || player || !isPremium) return;

    const setupPlayer = () => {
      const newPlayer = new (window as any).Spotify.Player({
        name: 'Spotify Profile',
        getOAuthToken: (cb: (token: string) => void) => {
          if (tokenRef.current) {
            cb(tokenRef.current);
          }
        },
        volume: 0.5
      });

      // Erros
      newPlayer.addListener('initialization_error', ({ message }: any) => { console.error('❌ Erro de Inicialização SDK:', message); });
      newPlayer.addListener('authentication_error', ({ message }: any) => { console.error('❌ Erro de Autenticação SDK:', message); });
      newPlayer.addListener('account_error', ({ message }: any) => { 
        console.error('❌ Erro de Conta (Precisa ser Premium):', message);
      });
      newPlayer.addListener('playback_error', ({ message }: any) => { 
        console.error('❌ Erro de Reprodução SDK:', message);
      });

      // Playback status updates
      newPlayer.addListener('player_state_changed', (state: any) => {
        if (!state) return;
        refetch();
      });

      // Ready
      newPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('✅ Player pronto no navegador! ID:', device_id);
        setDeviceId(device_id);
        
        // Ativar este dispositivo como o principal, mas SEM dar play automático
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${tokenRef.current}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ device_ids: [device_id], play: false }),
        }).catch(err => console.error('Erro ao transferir playback:', err));
      });

      // Not Ready
      newPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.warn('⚠️ O Player ficou offline:', device_id);
        setDeviceId(null);
      });

      newPlayer.connect().then((success: boolean) => {
        if (success) {
          console.log('🔌 Conectado ao Spotify SDK com sucesso!');
        } else {
          console.error('❌ Falha ao conectar ao Spotify SDK.');
        }
      });
      
      setPlayer(newPlayer);
    };

    if ((window as any).Spotify) {
      setupPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = setupPlayer;

      if (!document.getElementById('spotify-player-sdk')) {
        const script = document.createElement('script');
        script.id = 'spotify-player-sdk';
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [token, player, refetch, isPremium]);

  const isPlaying = optimisticPlaying !== null ? optimisticPlaying : (playbackState?.is_playing ?? false);
  const isLocalPlayer = playbackState?.device?.id === deviceId;

  const playTrack = useCallback(async (trackUri: string | string[], track?: SpotifyTrack) => {
    setOptimisticPlaying(true);
    // Exibe a track imediatamente no PlayerBar antes do refetch completar
    if (track) setOptimisticTrack(track);
    try {
      await playerApi.play(trackUri, deviceId);
      await refetch();
    } catch (error: any) {
      setOptimisticPlaying(null);
      setOptimisticTrack(null);
      if (error.status === 404) {
        alert('Nenhum dispositivo Spotify ativo encontrado. Aguarde o player carregar ou abra o Spotify em outro lugar.');
      } else {
        console.error('Erro ao tocar faixa:', error);
      }
    }
  }, [deviceId, refetch]);

  const togglePlay = useCallback(async () => {
    const nextState = !isPlaying;
    setOptimisticPlaying(nextState);

    try {
      // Se o player local for o atual, usamos o SDK diretamente para maior confiabilidade
      if (isLocalPlayer && player) {
        await player.togglePlay();
      } else {
        if (isPlaying) {
          await playerApi.pause();
        } else {
          await playerApi.play(undefined, deviceId);
        }
      }
      
      // Pequeno delay para a API refletir a mudança, mas o estado otimista já está ativo
      setTimeout(() => refetch(), 800);
    } catch (error) {
      setOptimisticPlaying(null);
      console.error('Erro ao alternar play/pause:', error);
    }
  }, [isPlaying, isLocalPlayer, player, deviceId, refetch]);

  const next = useCallback(async () => {
    try {
      await playerApi.next();
      await refetch();
    } catch (error) {
      console.error('Erro ao pular para próxima:', error);
    }
  }, [refetch]);

  const previous = useCallback(async () => {
    try {
      // Se a música já passou de 3 segundos, volta pro início dela. 
      // Caso contrário, volta para a faixa anterior. Comportamento padrão Spotify.
      if (playbackState && (playbackState.progress_ms ?? 0) > 3000) {
        await playerApi.seek(0);
      } else {
        await playerApi.previous();
      }
      await refetch();
    } catch (error) {
      console.error('Erro ao voltar para anterior:', error);
    }
  }, [playbackState, refetch]);

  const setVolume = useCallback(async (volumePercent: number) => {
    try {
      await playerApi.setVolume(volumePercent);
      await refetch();
    } catch (error) {
      console.error('Erro ao ajustar volume:', error);
    }
  }, [refetch]);

  const toggleShuffle = useCallback(async () => {
    if (!playbackState) return;
    const nextShuffleState = !playbackState.shuffle_state;
    try {
      await playerApi.toggleShuffle(nextShuffleState);
      await refetch();
    } catch (error) {
      console.error('Erro ao alternar shuffle:', error);
    }
  }, [playbackState, refetch]);

  const setRepeatMode = useCallback(async () => {
    if (!playbackState) return;
    
    // Cicla entre: off -> context -> track -> off
    const modes: ('off' | 'context' | 'track')[] = ['off', 'context', 'track'];
    const currentIndex = modes.indexOf(playbackState.repeat_state as any);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    try {
      await playerApi.setRepeatMode(nextMode);
      await refetch();
    } catch (error) {
      console.error('Erro ao alternar modo de repetição:', error);
    }
  }, [playbackState, refetch]);

  return (
    <PlayerContext.Provider
      value={{
        playbackState,
        isLoading,
        isPlaying,
        deviceId,
        optimisticTrack,
        playTrack,
        togglePlay,
        next,
        previous,
        setVolume,
        toggleShuffle,
        setRepeatMode,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
