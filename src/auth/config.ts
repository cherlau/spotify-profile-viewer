export const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
export const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string;

// Scopes base — disponíveis para todos os usuários (Free e Premium)
export const BASE_SCOPES = [
  'user-read-private',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-recently-played',
  'user-follow-read',
  'user-library-read',
  'user-read-playback-state', // leitura apenas — não requer Premium
].join(' ');

// Scopes Premium — necessários para Web Playback SDK e controles de playback
export const PREMIUM_SCOPES = [
  ...BASE_SCOPES.split(' '),
  'streaming',                  // Web Playback SDK (exclusivo Premium)
  'user-modify-playback-state', // play/pause/skip/volume (exclusivo Premium)
].join(' ');

// Login padrão usa BASE_SCOPES — evita 403 em loop para usuários Free
export const SCOPES = BASE_SCOPES;

export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
