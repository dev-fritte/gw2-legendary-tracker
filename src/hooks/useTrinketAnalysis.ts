import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '@/services/apiClient';
import { calculateTrinketRecommendations, collectItemIds } from '@/utils/calculation';
import type { Character, GW2Item, LegendaryArmoryItem } from '@/types/gw2-api';

function useArmory(apiKey: string) {
  return useQuery({
    queryKey: ['legendaryArmory', apiKey],
    queryFn: (): Promise<LegendaryArmoryItem[]> => getApiClient(apiKey).getLegendaryArmory(),
    staleTime: 5 * 60 * 1000,
  });
}

function useItems(apiKey: string, ids: number[], enabled: boolean) {
  return useQuery({
    queryKey: ['items', ids],
    queryFn: async (): Promise<GW2Item[]> => getApiClient(apiKey).getItems(ids),
    enabled: enabled && ids.length > 0,
    staleTime: 60 * 60 * 1000,
  });
}

export function useTrinketAnalysis(apiKey: string, characters: Character[]) {
  const armoryQuery = useArmory(apiKey);
  const armory = armoryQuery.data ?? [];

  // Shares the same query key as useWeaponAnalysis — no extra API call
  const itemIds = armoryQuery.isSuccess ? collectItemIds(characters, armory) : [];
  const itemsQuery = useItems(apiKey, itemIds, armoryQuery.isSuccess);

  const allArmoryQuery = useQuery({
    queryKey: ['legendaryArmory', 'all'],
    queryFn: () => getApiClient(apiKey).getAllLegendaryArmory(),
    staleTime: 24 * 60 * 60 * 1000,
  });
  const allLegendaryIds = useMemo(
    () => (allArmoryQuery.data ?? []).map((e) => e.id),
    [allArmoryQuery.data],
  );
  const allLegendaryItemsQuery = useItems(apiKey, allLegendaryIds, allLegendaryIds.length > 0);

  const itemMap = useMemo(() => {
    const map = new Map<number, GW2Item>();
    for (const item of allLegendaryItemsQuery.data ?? []) map.set(item.id, item);
    for (const item of itemsQuery.data ?? []) map.set(item.id, item);
    return map;
  }, [itemsQuery.data, allLegendaryItemsQuery.data]);

  const result =
    itemsQuery.isSuccess && allArmoryQuery.isSuccess
      ? calculateTrinketRecommendations(characters, itemMap, armory)
      : null;

  return {
    result,
    isLoading: armoryQuery.isPending || itemsQuery.isPending || allArmoryQuery.isPending,
    error: armoryQuery.error ?? itemsQuery.error ?? allArmoryQuery.error,
  };
}
