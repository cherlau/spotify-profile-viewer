export const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
export const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string;

export const SCOPES = [
  'user-read-private',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-recently-played',
  'user-follow-read',
  'user-library-read',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
