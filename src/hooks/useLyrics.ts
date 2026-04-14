import { useQuery } from '@tanstack/react-query';

/**
 * Faz o parse do formato LRC [mm:ss.xx] para milissegundos e texto.
 */
function parseLRC(lrc: string): { timeMs: number; text: string }[] {
  return lrc
    .split('\n')
    .map(line => {
      const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
      if (!match) return null;
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      return {
        timeMs: (minutes * 60 + seconds) * 1000,
        text
      };
    })
    .filter((line): line is { timeMs: number; text: string } => line !== null);
}

export function useLyrics(trackName: string | undefined, artistName: string | undefined) {
  const { data: lyrics = [], isLoading } = useQuery({
    queryKey: ['lyrics', trackName, artistName],
    queryFn: async () => {
      try {
        const query = new URLSearchParams({ 
          track_name: trackName!, 
          artist_name: artistName! 
        });
        const response = await fetch(`https://lrclib.net/api/get?${query}`);
        
        if (!response.ok) return [];
        
        const data = await response.json();
        return data.syncedLyrics ? parseLRC(data.syncedLyrics) : [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!trackName && !!artistName,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 1 hora
    refetchOnWindowFocus: false,
    retry: false,
  });

  return { lyrics, isLoading };
}
