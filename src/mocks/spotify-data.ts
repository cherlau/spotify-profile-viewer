// MOCK SYSTEM — toggle via VITE_USE_MOCK in .env
// Este arquivo NÃO deve ser importado diretamente pelos componentes.
// Todo acesso passa por src/services/spotify-client.ts.

import type {
  SpotifyUserProfile,
  TopArtistsResponse,
  TopTracksResponse,
  UserPlaylistsResponse,
  RecentlyPlayedResponse,
  FollowedArtistsResponse,
  SavedAlbumsResponse,
  SavedShowsResponse,
  SpotifyArtist,
  SpotifyTrack,
  SpotifyAlbumSimplified,
  SpotifyArtistSimplified,
  SpotifyQueueResponse,
} from '../types/spotify';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function artistSimplified(id: string, name: string): SpotifyArtistSimplified {
  return {
    external_urls: { spotify: `https://open.spotify.com/artist/${id}` },
    href: `https://api.spotify.com/v1/artists/${id}`,
    id,
    name,
    type: 'artist',
    uri: `spotify:artist:${id}`,
  };
}

function albumSimplified(
  id: string,
  name: string,
  artists: SpotifyArtistSimplified[],
  imageIndex: number,
  release_date: string,
): SpotifyAlbumSimplified {
  return {
    album_type: 'album',
    total_tracks: 12,
    external_urls: { spotify: `https://open.spotify.com/album/${id}` },
    href: `https://api.spotify.com/v1/albums/${id}`,
    id,
    images: [
      { url: `https://picsum.photos/seed/album${imageIndex}/640/640`, height: 640, width: 640 },
      { url: `https://picsum.photos/seed/album${imageIndex}/300/300`, height: 300, width: 300 },
      { url: `https://picsum.photos/seed/album${imageIndex}/64/64`, height: 64, width: 64 },
    ],
    name,
    release_date,
    release_date_precision: 'day',
    type: 'album',
    uri: `spotify:album:${id}`,
    artists,
  };
}

function track(
  id: string,
  name: string,
  albumId: string,
  albumName: string,
  artistId: string,
  artistName: string,
  duration_ms: number,
  imageIndex: number,
  release_date: string,
  hasPreview: boolean,
): SpotifyTrack {
  const artist = artistSimplified(artistId, artistName);
  const album = albumSimplified(albumId, albumName, [artist], imageIndex, release_date);
  return {
    album,
    artists: [artist],
    disc_number: 1,
    duration_ms,
    explicit: false,
    external_ids: { isrc: `US${id.slice(0, 10).toUpperCase()}` },
    external_urls: { spotify: `https://open.spotify.com/track/${id}` },
    href: `https://api.spotify.com/v1/tracks/${id}`,
    id,
    is_local: false,
    name,
    preview_url: hasPreview
      ? `https://p.scdn.co/mp3-preview/${id}?cid=mockpreview`
      : null,
    track_number: 1,
    type: 'track',
    uri: `spotify:track:${id}`,
  };
}

function artist(
  id: string,
  name: string,
  genres: string[],
  imageIndex: number,
): SpotifyArtist {
  return {
    external_urls: { spotify: `https://open.spotify.com/artist/${id}` },
    genres,
    href: `https://api.spotify.com/v1/artists/${id}`,
    id,
    images: [
      { url: `https://picsum.photos/seed/art${imageIndex}/640/640`, height: 640, width: 640 },
      { url: `https://picsum.photos/seed/art${imageIndex}/300/300`, height: 300, width: 300 },
      { url: `https://picsum.photos/seed/art${imageIndex}/64/64`, height: 64, width: 64 },
    ],
    name,
    type: 'artist',
    uri: `spotify:artist:${id}`,
  };
}

// ─── GET /me ──────────────────────────────────────────────────────────────────

export const mockProfile: SpotifyUserProfile = {
  display_name: 'Lucas Mockado',
  external_urls: { spotify: 'https://open.spotify.com/user/mockuserid123' },
  href: 'https://api.spotify.com/v1/users/mockuserid123',
  id: 'mockuserid123',
  images: [
    { url: 'https://picsum.photos/seed/userprofile/300/300', height: 300, width: 300 },
    { url: 'https://picsum.photos/seed/userprofile/64/64', height: 64, width: 64 },
  ],
  type: 'user',
  uri: 'spotify:user:mockuserid123',
};

// ─── GET /me/top/tracks ───────────────────────────────────────────────────────

const topTracksItems: SpotifyTrack[] = [
  track('4iV5W9uYEdYUVa79Axb7Rh', 'Blinding Lights',  'album4iV5W9', 'After Hours',   'artist0du5', 'The Weeknd',       200040, 1,  '2020-03-20', true),
  track('6UelLqGlWMcVH1E5c4H7lY', 'As It Was',        'albumHarry1', 'Harry\'s House', 'artistHarr', 'Harry Styles',    167303, 2,  '2022-05-20', true),
  track('7qiZfU4dY1lWllzX7mPBI3', 'Shape of You',     'albumDivide',  '÷ (Divide)',    'artistEd11', 'Ed Sheeran',      233713, 3,  '2017-03-03', true),
  track('0VjIjW4GlULA5KXv3hjFuV', 'Watermelon Sugar', 'albumFine01',  'Fine Line',    'artistHarr', 'Harry Styles',    174180, 4,  '2019-12-13', false),
  track('5Z01UMMf7V1o0MzF86s6WJ', 'STAY',             'albumStay11',  'STAY (with Justin Bieber)', 'artistKidL', 'Kid LAROI', 141805, 5, '2021-07-09', true),
  track('1Cv1YLb3My9J0erBD2ASXF', 'Levitating',       'albumFutur1',  'Future Nostalgia', 'artistDua1', 'Dua Lipa',    203064, 6,  '2020-03-27', true),
  track('3CeCwYWvdfXbZLXFhBrbnf', 'Bad Guy',           'albumWhen00',  'WHEN WE ALL FALL ASLEEP', 'artistBill', 'Billie Eilish', 194088, 7, '2019-03-29', false),
  track('2takcwOaAZWiXM4aMs6v1I', 'Sunflower',        'albumSpMile',  'Spider-Man: Into the Spider-Verse', 'artistPost', 'Post Malone', 158040, 8, '2018-10-18', true),
  track('7lPN2DXiMsVn7XUKtOW1CS', 'drivers license',  'albumSour11',  'SOUR',         'artistOliv', 'Olivia Rodrigo', 242040, 9,  '2021-05-21', true),
  track('0DiWol3ao7actDDUD4JHDE', 'Peaches',           'albumJustice', 'Justice',      'artistJust', 'Justin Bieber',  198061, 10, '2021-03-19', false),
];

export const mockTopTracks: TopTracksResponse = {
  href: 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10&offset=0',
  limit: 10,
  next: null,
  offset: 0,
  previous: null,
  total: 10,
  items: topTracksItems,
};

// ─── GET /me/top/artists ──────────────────────────────────────────────────────

const topArtistsItems: SpotifyArtist[] = [
  artist('artist0du5', 'The Weeknd',      ['canadian pop', 'pop', 'r&b'],                    1),
  artist('artistHarr', 'Harry Styles',   ['pop', 'uk pop', 'soft rock'],                     2),
  artist('artistDua1', 'Dua Lipa',       ['dance pop', 'pop', 'uk pop'],                     3),
  artist('artistTayl', 'Taylor Swift',   ['pop', 'country pop', 'singer-songwriter'],         4),
  artist('artistBill', 'Billie Eilish',  ['electropop', 'pop', 'indie pop'],                  5),
  artist('artistEd11', 'Ed Sheeran',     ['pop', 'singer-songwriter', 'uk pop'],              6),
  artist('artistPost', 'Post Malone',    ['dfw rap', 'melodic rap', 'pop'],                   7),
  artist('artistOliv', 'Olivia Rodrigo', ['pop', 'pov: indie', 'gen z singer-songwriter'],   8),
  artist('artistKidL', 'The Kid LAROI',  ['australian hip hop', 'pop', 'melodic rap'],        9),
  artist('artistJust', 'Justin Bieber',  ['canadian pop', 'pop'],                            10),
];

export const mockTopArtists: TopArtistsResponse = {
  href: 'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10&offset=0',
  limit: 10,
  next: null,
  offset: 0,
  previous: null,
  total: 10,
  items: topArtistsItems,
};

// ─── GET /me/playlists ────────────────────────────────────────────────────────

const playlistNames = [
  'Chill Vibes',
  'Morning Run',
  'Late Night Study',
  'Road Trip 2024',
  'Throwback Hits',
  'Workout Bangers',
  'Sunday Brunch',
  'Focus Mode',
  'Party Starters',
  'Sad Hours',
  'Indie Discoveries',
  'Brazilian Beats',
  'Jazz & Coffee',
  'Summer 2023',
  'Acoustic Sessions',
  'EDM Festival',
  'R&B Grooves',
  'Hip Hop Classics',
  'Pop Anthems',
  'Sleep Sounds',
];

export const mockPlaylists: UserPlaylistsResponse = {
  href: 'https://api.spotify.com/v1/me/playlists?limit=20&offset=0',
  limit: 20,
  next: null,
  offset: 0,
  previous: null,
  total: 20,
  items: playlistNames.map((name, i) => ({
    collaborative: false,
    description: `Uma playlist incrível chamada ${name}.`,
    external_urls: { spotify: `https://open.spotify.com/playlist/mockpl${String(i).padStart(3, '0')}` },
    href: `https://api.spotify.com/v1/playlists/mockpl${String(i).padStart(3, '0')}`,
    id: `mockpl${String(i).padStart(3, '0')}`,
    images: [
      { url: `https://picsum.photos/seed/playlist${i}/300/300`, height: 300, width: 300 },
    ],
    name,
    owner: {
      external_urls: { spotify: 'https://open.spotify.com/user/mockuserid123' },
      href: 'https://api.spotify.com/v1/users/mockuserid123',
      id: 'mockuserid123',
      type: 'user',
      uri: 'spotify:user:mockuserid123',
      display_name: 'Lucas Mockado',
    },
    public: i % 3 !== 0,
    snapshot_id: `snap${i}AbCdEfGhIjKlMnOpQrStUvWxYz`,
    items: {
      href: `https://api.spotify.com/v1/playlists/mockpl${String(i).padStart(3, '0')}/tracks`,
      total: 10 + i * 3,
    },
    type: 'playlist',
    uri: `spotify:playlist:mockpl${String(i).padStart(3, '0')}`,
  })),
};

// ─── GET /me/player/recently-played ──────────────────────────────────────────

// Reutiliza as top tracks em ordem embaralhada com timestamps decrescentes
const recentTracks = [
  topTracksItems[2],
  topTracksItems[0],
  topTracksItems[7],
  topTracksItems[4],
  topTracksItems[1],
  topTracksItems[9],
  topTracksItems[3],
  topTracksItems[6],
  topTracksItems[5],
  topTracksItems[8],
  topTracksItems[0],
  topTracksItems[2],
  topTracksItems[1],
  topTracksItems[3],
  topTracksItems[7],
  topTracksItems[5],
  topTracksItems[9],
  topTracksItems[4],
  topTracksItems[6],
  topTracksItems[8],
];

const now = Date.now();

export const mockRecentlyPlayed: RecentlyPlayedResponse = {
  href: 'https://api.spotify.com/v1/me/player/recently-played?limit=20',
  limit: 20,
  next: null,
  cursors: {
    after: String(now),
    before: String(now - 20 * 60 * 60 * 1000),
  },
  total: 20,
  items: recentTracks.map((t, i) => ({
    track: t,
    played_at: new Date(now - i * 18 * 60 * 1000).toISOString(),
    context: i % 4 === 0
      ? null
      : {
          type: 'playlist',
          href: `https://api.spotify.com/v1/playlists/mockpl${String(i % 5).padStart(3, '0')}`,
          external_urls: { spotify: `https://open.spotify.com/playlist/mockpl${String(i % 5).padStart(3, '0')}` },
          uri: `spotify:playlist:mockpl${String(i % 5).padStart(3, '0')}`,
        },
  })),
};

// ─── GET /me/following ────────────────────────────────────────────────────────

// Inclui os top artists + 10 artistas adicionais
const additionalFollowedArtists: SpotifyArtist[] = [
  artist('artistAriana', 'Ariana Grande',  ['dance pop', 'pop', 'trap pop'],                11),
  artist('artistDrake',  'Drake',          ['canadian hip hop', 'hip hop', 'rap'],           12),
  artist('artistSZA',    'SZA',            ['pop', 'r&b', 'neo soul'],                      13),
  artist('artistBrunoM', 'Bruno Mars',     ['funk', 'pop', 'soft rock'],                    14),
  artist('artistLizzo',  'Lizzo',          ['dance pop', 'escape room', 'pop'],              15),
  artist('artistKendrick','Kendrick Lamar',['conscious hip hop', 'hip hop', 'rap'],          16),
  artist('artistColdplay','Coldplay',      ['permanent wave', 'pop', 'rock'],                17),
  artist('artistAdele',  'Adele',          ['british soul', 'pop', 'uk pop'],                18),
  artist('artistSabrina','Sabrina Carpenter',['pop', 'pov: indie', 'singer-songwriter'],    19),
  artist('artistChapell','Chappell Roan',  ['indie pop', 'pov: indie', 'art pop'],          20),
];

export const mockFollowedArtists: FollowedArtistsResponse = {
  artists: {
    href: 'https://api.spotify.com/v1/me/following?type=artist&limit=20',
    limit: 20,
    next: null,
    cursors: { after: null },
    total: 20,
    items: [...topArtistsItems, ...additionalFollowedArtists],
  },
};

// ─── GET /me/albums ───────────────────────────────────────────────────────────

const albumData = [
  { id: 'album4iV5W9', name: 'After Hours',              artistId: 'artist0du5', artistName: 'The Weeknd',       date: '2020-03-20', img: 1 },
  { id: 'albumHarry1', name: "Harry's House",            artistId: 'artistHarr', artistName: 'Harry Styles',    date: '2022-05-20', img: 2 },
  { id: 'albumDivide', name: '÷ (Divide)',                artistId: 'artistEd11', artistName: 'Ed Sheeran',       date: '2017-03-03', img: 3 },
  { id: 'albumFine01', name: 'Fine Line',                artistId: 'artistHarr', artistName: 'Harry Styles',    date: '2019-12-13', img: 4 },
  { id: 'albumFutur1', name: 'Future Nostalgia',         artistId: 'artistDua1', artistName: 'Dua Lipa',         date: '2020-03-27', img: 5 },
  { id: 'albumWhen00', name: 'WHEN WE ALL FALL ASLEEP',  artistId: 'artistBill', artistName: 'Billie Eilish',   date: '2019-03-29', img: 6 },
  { id: 'albumSour11', name: 'SOUR',                     artistId: 'artistOliv', artistName: 'Olivia Rodrigo',  date: '2021-05-21', img: 7 },
  { id: 'albumJusti2', name: 'Justice',                  artistId: 'artistJust', artistName: 'Justin Bieber',   date: '2021-03-19', img: 8 },
  { id: 'albumMidni3', name: 'Midnights',                artistId: 'artistTayl', artistName: 'Taylor Swift',    date: '2022-10-21', img: 9 },
  { id: 'albumGuts11', name: 'GUTS',                     artistId: 'artistOliv', artistName: 'Olivia Rodrigo',  date: '2023-09-08', img: 10 },
];

export const mockSavedAlbums: SavedAlbumsResponse = {
  href: 'https://api.spotify.com/v1/me/albums?limit=20&offset=0',
  limit: 20,
  next: null,
  offset: 0,
  previous: null,
  total: albumData.length,
  items: albumData.map((a, i) => ({
    added_at: new Date(now - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
    album: {
      album_type: 'album' as const,
      total_tracks: 12,
      external_urls: { spotify: `https://open.spotify.com/album/${a.id}` },
      href: `https://api.spotify.com/v1/albums/${a.id}`,
      id: a.id,
      images: [
        { url: `https://picsum.photos/seed/album${a.img}/640/640`, height: 640, width: 640 },
        { url: `https://picsum.photos/seed/album${a.img}/300/300`, height: 300, width: 300 },
        { url: `https://picsum.photos/seed/album${a.img}/64/64`, height: 64, width: 64 },
      ],
      name: a.name,
      release_date: a.date,
      release_date_precision: 'day' as const,
      type: 'album' as const,
      uri: `spotify:album:${a.id}`,
      artists: [artistSimplified(a.artistId, a.artistName)],
    },
  })),
};

// ─── GET /me/shows ────────────────────────────────────────────────────────────

const showData = [
  { id: 'show001', name: 'Lex Fridman Podcast',          publisher: 'Lex Fridman',        episodes: 430, img: 1 },
  { id: 'show002', name: 'How I Built This',             publisher: 'NPR',                episodes: 520, img: 2 },
  { id: 'show003', name: 'The Daily',                    publisher: 'The New York Times',  episodes: 1800, img: 3 },
  { id: 'show004', name: 'Huberman Lab',                 publisher: 'Andrew Huberman',    episodes: 180, img: 4 },
  { id: 'show005', name: 'Darknet Diaries',              publisher: 'Jack Rhysider',      episodes: 150, img: 5 },
  { id: 'show006', name: 'Freakonomics Radio',           publisher: 'Freakonomics',       episodes: 600, img: 6 },
  { id: 'show007', name: 'My First Million',             publisher: 'The Hustle',         episodes: 500, img: 7 },
  { id: 'show008', name: 'Conan O\'Brien Needs a Friend', publisher: 'Team Coco & Earwolf', episodes: 270, img: 8 },
];

export const mockSavedShows: SavedShowsResponse = {
  href: 'https://api.spotify.com/v1/me/shows?limit=20&offset=0',
  limit: 20,
  next: null,
  offset: 0,
  previous: null,
  total: showData.length,
  items: showData.map((s, i) => ({
    added_at: new Date(now - i * 14 * 24 * 60 * 60 * 1000).toISOString(),
    show: {
      description: `Episódios de ${s.name} com conteúdo semanal sobre tecnologia, ciência e cultura.`,
      explicit: false,
      external_urls: { spotify: `https://open.spotify.com/show/${s.id}` },
      href: `https://api.spotify.com/v1/shows/${s.id}`,
      id: s.id,
      images: [
        { url: `https://picsum.photos/seed/show${s.img}/640/640`, height: 640, width: 640 },
        { url: `https://picsum.photos/seed/show${s.img}/300/300`, height: 300, width: 300 },
      ],
      languages: ['en'],
      media_type: 'audio',
      name: s.name,
      publisher: s.publisher,
      total_episodes: s.episodes,
      type: 'show' as const,
      uri: `spotify:show:${s.id}`,
    },
  })),
};

// ─── GET /me/player/queue ────────────────────────────────────────────────────

export const mockQueue: SpotifyQueueResponse = {
  currently_playing: topTracksItems[0],
  queue: topTracksItems.slice(1, 6),
};
