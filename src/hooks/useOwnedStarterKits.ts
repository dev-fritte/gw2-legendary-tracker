import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '@/services/apiClient';
import { STARTER_KIT_IDS } from '@/utils/starterKits';

export function useOwnedStarterKits(apiKey: string) {
  const bankQuery = useQuery({
    queryKey: ['accountBank', apiKey],
    queryFn: () => getApiClient(apiKey).getAccountBank(),
    staleTime: 5 * 60 * 1000,
  });

  const charsQuery = useQuery({
    queryKey: ['characters', apiKey],
    queryFn: () => getApiClient(apiKey).getAllCharacters(),
    staleTime: 5 * 60 * 1000,
  });

  const ownedCounts = useMemo((): Map<number, number> => {
    const counts = new Map<number, number>();

    if (bankQuery.data) {
      for (const slot of bankQuery.data) {
        if (slot && STARTER_KIT_IDS.has(slot.id)) {
          counts.set(slot.id, (counts.get(slot.id) ?? 0) + 1);
        }
      }
    }

    if (charsQuery.data) {
      for (const char of charsQuery.data) {
        if (!char.bags) continue;
        for (const bag of char.bags) {
          if (!bag) continue;
          for (const item of bag.inventory) {
            if (item && STARTER_KIT_IDS.has(item.id)) {
              counts.set(item.id, (counts.get(item.id) ?? 0) + 1);
            }
          }
        }
      }
    }

    return counts;
  }, [bankQuery.data, charsQuery.data]);

  return {
    ownedCounts,
    isLoading: bankQuery.isPending || charsQuery.isPending,
    error: bankQuery.error ?? charsQuery.error,
    refetch: () => {
      void bankQuery.refetch();
      void charsQuery.refetch();
    },
  };
}
