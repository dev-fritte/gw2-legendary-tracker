import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '@/services/apiClient';
import type { Character } from '@/types/gw2-api';

export function useCharacters(apiKey: string) {
  return useQuery({
    queryKey: ['characters', apiKey],
    queryFn: () => getApiClient(apiKey).getAllCharacters(),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: Character[] | undefined) => prev,
  });
}
