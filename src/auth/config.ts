import { ENABLE_REAL_AUDIO } from '../config/featureFlags';

export const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
export const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string;

// Scopes de leitura — não exigem Premium nem controle de dispositivo
const BASE_SCOPES = [
  'user-read-private',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-recently-played',
  'user-follow-read',
  'user-library-read',
  'user-read-playback-state',    // leitura apenas — não requer Premium
  'user-read-currently-playing', // leitura apenas — não requer Premium
];

// Scopes de controle — exclusivos para reprodução real (requer Premium)
const AUDIO_SCOPES = [
  'streaming',                   // Web Playback SDK (exclusivo Premium)
  'user-modify-playback-state',  // play/pause/skip/volume (exclusivo Premium)
];

// Solicita scopes de controle apenas quando áudio real está habilitado.
// No Modo Portfólio, apenas leitura é pedida — menor chance de rejeição na cota pública.
export const SCOPES = [
  ...BASE_SCOPES,
  ...(ENABLE_REAL_AUDIO ? AUDIO_SCOPES : []),
].join(' ');

// Mantido para compatibilidade com código existente que importe diretamente
export const BASE_SCOPES_STRING = BASE_SCOPES.join(' ');

export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
