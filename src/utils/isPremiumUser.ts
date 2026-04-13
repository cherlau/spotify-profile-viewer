import type { SpotifyUserProfile } from '../types/spotify';

/** Retorna false quando profile é undefined/null (assume Free por segurança). */
export function isPremiumUser(profile: SpotifyUserProfile | undefined | null): boolean {
  if (!profile) return false;
  return profile.product === 'premium';
}
