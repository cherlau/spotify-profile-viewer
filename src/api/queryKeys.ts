/**
 * Chaves de query centralizadas para garantir cache consistente entre páginas.
 * Usar estas constantes em todos os hooks — nunca strings inline.
 */
export const queryKeys = {
  profile: ['profile'] as const,
  topArtists: (limit: number) => ['top-artists', { limit }] as const,
  topTracks: (limit: number) => ['top-tracks', { limit }] as const,
  playlists: (limit: number) => ['playlists', { limit }] as const,
  recentlyPlayed: (limit: number) => ['recently-played', { limit }] as const,
  followedArtists: (limit: number) => ['followed-artists', { limit }] as const,
  savedAlbums: (limit: number) => ['saved-albums', { limit }] as const,
  savedShows: (limit: number) => ['saved-shows', { limit }] as const,
} as const;
