import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { usePlaybackState } from '../hooks/usePlaybackState';
import { useProfile } from '../hooks/useProfile';
import * as playerApi from '../api/player';
import type { SpotifyPlaybackState } from '../types/spotify';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

interface PlayerContextType {
  playbackState: SpotifyPlaybackState | null;
  isLoading: boolean;
  isPlaying: boolean;
  deviceId: string | null;
  playTrack: (trackUri: string) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setVolume: (volumePercent: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useSpotifyAuth();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [optimisticPlaying, setOptimisticPlaying] = useState<boolean | null>(null);
  const tokenRef = useRef<string | null>(token);

  // Mantém o ref atualizado para o callback getOAuthToken
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);
  
  const { data: profile } = useProfile();

  // Polling a cada 5 segundos para manter o estado sincronizado
  const { data: playbackState, isLoading, refetch } = usePlaybackState({
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  // Sincroniza o estado otimista com o real quando a API responde
  useEffect(() => {
    if (playbackState !== undefined) {
      setOptimisticPlaying(null);
    }
  }, [playbackState]);

  // Inicialização do Web Playback SDK
  useEffect(() => {
    if (!token || player) return;

    const setupPlayer = () => {
      const newPlayer = new (window as any).Spotify.Player({
        name: 'Web Player (Spotify Clone)',
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
  }, [token, player, refetch]);

  const isPlaying = optimisticPlaying !== null ? optimisticPlaying : (playbackState?.is_playing ?? false);
  const isLocalPlayer = playbackState?.device?.id === deviceId;

  const playTrack = useCallback(async (trackUri: string) => {
    if (profile && profile.product !== 'premium') {
      alert('A reprodução via SDK requer uma conta Spotify Premium. O erro 403 (Forbidden) no Widevine é esperado para contas Free.');
      return;
    }

    setOptimisticPlaying(true);
    try {
      await playerApi.play(trackUri, deviceId);
      await refetch();
    } catch (error: any) {
      setOptimisticPlaying(null);
      if (error.status === 404) {
        alert('Nenhum dispositivo Spotify ativo encontrado. Aguarde o player carregar ou abra o Spotify em outro lugar.');
      } else {
        console.error('Erro ao tocar faixa:', error);
      }
    }
  }, [deviceId, refetch, profile]);

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
      await playerApi.previous();
      await refetch();
    } catch (error) {
      console.error('Erro ao voltar para anterior:', error);
    }
  }, [refetch]);

  const setVolume = useCallback(async (volumePercent: number) => {
    try {
      await playerApi.setVolume(volumePercent);
      await refetch();
    } catch (error) {
      console.error('Erro ao ajustar volume:', error);
    }
  }, [refetch]);

  return (
    <PlayerContext.Provider
      value={{
        playbackState,
        isLoading,
        isPlaying,
        deviceId,
        playTrack,
        togglePlay,
        next,
        previous,
        setVolume,
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
