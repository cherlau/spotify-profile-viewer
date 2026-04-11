/**
 * Spotify API Types — /me endpoints
 * Source: specs/api-contract.md
 *
 * BREAKING CHANGES (Feb 2026) — fields that NO LONGER EXIST and must NOT be used:
 *   User:    country, email, explicit_content, followers, product
 *   Artist:  followers, popularity
 *   Track:   available_markets, linked_from, popularity
 *   Album:   album_group, available_markets, label, popularity
 *
 * Playlist: field "tracks" renamed to "items" (Feb 2026)
 */

// ─── Shared primitives ────────────────────────────────────────────────────────

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

// ─── GET /me ─────────────────────────────────────────────────────────────────

/** Response shape for GET /me (scope: user-read-private) */
export interface SpotifyUserProfile {
  display_name: string | null;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  product: string;
  type: "user";
  uri: string;
}

// ─── GET /me/top/{type} ───────────────────────────────────────────────────────

export type TimeRange = "short_term" | "medium_term" | "long_term";

/** Full artist object (returned by /me/top/artists and /me/following) */
export interface SpotifyArtist {
  external_urls: SpotifyExternalUrls;
  genres: string[];
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  type: "artist";
  uri: string;
  // ❌ removed Feb 2026: followers, popularity
}

/** Simplified artist reference (nested inside Track and Album) */
export interface SpotifyArtistSimplified {
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
}

/** Simplified album object (nested inside Track) */
export interface SpotifyAlbumSimplified {
  album_type: "album" | "single" | "compilation";
  total_tracks: number;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  type: "album";
  uri: string;
  artists: SpotifyArtistSimplified[];
  // ❌ removed Feb 2026: album_group, available_markets, label, popularity
}

export interface SpotifyTrack {
  album: SpotifyAlbumSimplified;
  artists: SpotifyArtistSimplified[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  preview_url: string | null;
  track_number: number;
  type: "track";
  uri: string;
  // ❌ removed Feb 2026: popularity, available_markets, linked_from
}

/** Paginated response for GET /me/top/artists */
export interface TopArtistsResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SpotifyArtist[];
}

/** Paginated response for GET /me/top/tracks */
export interface TopTracksResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SpotifyTrack[];
}

// ─── GET /me/playlists ────────────────────────────────────────────────────────

export interface SpotifyPlaylistSimplified {
  collaborative: boolean;
  description: string | null;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  owner: {
    external_urls: SpotifyExternalUrls;
    href: string;
    id: string;
    type: "user";
    uri: string;
    display_name: string | null;
  };
  public: boolean | null;
  snapshot_id: string;
  /** ⚠️ Renamed from "tracks" to "items" in Feb 2026 */
  items: {
    href: string;
    total: number;
  };
  type: "playlist";
  uri: string;
}

/** Paginated response for GET /me/playlists */
export interface UserPlaylistsResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SpotifyPlaylistSimplified[];
}

// ─── GET /me/player/recently-played ──────────────────────────────────────────

export interface PlayHistoryObject {
  track: SpotifyTrack;
  played_at: string;
  context: {
    type: "album" | "artist" | "playlist";
    href: string;
    external_urls: SpotifyExternalUrls;
    uri: string;
  } | null;
}

export interface RecentlyPlayedResponse {
  href: string;
  limit: number;
  next: string | null;
  cursors: {
    after: string;
    before: string;
  };
  total: number;
  items: PlayHistoryObject[];
}

// ─── GET /me/following ────────────────────────────────────────────────────────

export interface FollowedArtistsResponse {
  artists: {
    href: string;
    limit: number;
    next: string | null;
    cursors: {
      after: string | null;
    };
    total: number;
    items: SpotifyArtist[];
  };
}

// ─── GET /me/albums ───────────────────────────────────────────────────────────

export interface SpotifyAlbum {
  album_type: "album" | "single" | "compilation";
  total_tracks: number;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  type: "album";
  uri: string;
  artists: SpotifyArtistSimplified[];
}

export interface SavedAlbumObject {
  added_at: string;
  album: SpotifyAlbum;
}

export interface SavedAlbumsResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SavedAlbumObject[];
}

// ─── GET /me/shows ────────────────────────────────────────────────────────────

export interface SpotifyShow {
  description: string;
  explicit: boolean;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  languages: string[];
  media_type: string;
  name: string;
  publisher: string;
  total_episodes: number;
  type: "show";
  uri: string;
}

export interface SavedShowObject {
  added_at: string;
  show: SpotifyShow;
}

export interface SavedShowsResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SavedShowObject[];
}

// ─── GET /me/player ──────────────────────────────────────────────────────────

export interface SpotifyDevice {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
}

export interface SpotifyPlaybackState {
  device: SpotifyDevice;
  repeat_state: "off" | "track" | "context";
  shuffle_state: boolean;
  context: {
    type: string;
    href: string;
    external_urls: SpotifyExternalUrls;
    uri: string;
  } | null;
  timestamp: number;
  progress_ms: number | null;
  is_playing: boolean;
  item: SpotifyTrack | null;
  currently_playing_type: "track" | "episode" | "ad" | "unknown";
}

/** Response shape for GET /me/player/queue (scope: user-read-playback-state) */
export interface SpotifyQueueResponse {
  currently_playing: SpotifyTrack | null;
  queue: SpotifyTrack[];
}

// ─── Auth — Token exchange response (auth-flow.md) ────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: "Bearer";
  scope: string;
  expires_in: number;
  refresh_token: string;
}

// ─── Error ────────────────────────────────────────────────────────────────────

export interface SpotifyError {
  error: {
    status: number;
    message: string;
  };
}
