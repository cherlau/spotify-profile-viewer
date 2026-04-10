import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api/profile';
import { queryKeys } from '../api/queryKeys';

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  });
}
