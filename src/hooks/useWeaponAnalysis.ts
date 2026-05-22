import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '@/services/apiClient';
import { calculateRecommendations, collectItemIds } from '@/utils/calculation';
import type { Character, GW2Item, LegendaryArmoryItem, WeaponType } from '@/types/gw2-api';

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

export function useWeaponAnalysis(
  apiKey: string,
  characters: Character[],
  starterKitMap: Map<WeaponType, number> = new Map(),
  prioritiseStarterKits: boolean = true
) {
  const armoryQuery = useArmory(apiKey);
  const armory = armoryQuery.data ?? [];

  const itemIds = armoryQuery.isSuccess ? collectItemIds(characters, armory) : [];
  const itemsQuery = useItems(apiKey, itemIds, armoryQuery.isSuccess);

  // Fetch ALL legendary item data to supply icons for weapon types that are
  // neither equipped nor owned. Shares cache with Overview / StarterKits pages.
  const allArmoryQuery = useQuery({
    queryKey: ['legendaryArmory', 'all'],
    queryFn: () => getApiClient(apiKey).getAllLegendaryArmory(),
    staleTime: 24 * 60 * 60 * 1000,
  });
  const allLegendaryIds = useMemo(
    () => (allArmoryQuery.data ?? []).map((e) => e.id),
    [allArmoryQuery.data]
  );
  const allLegendaryItemsQuery = useItems(apiKey, allLegendaryIds, allLegendaryIds.length > 0);

  // Merge: character/owned-armory items take precedence, all-legendary fills the gaps.
  const itemMap = useMemo(() => {
    const map = new Map<number, GW2Item>();
    for (const item of allLegendaryItemsQuery.data ?? []) map.set(item.id, item);
    for (const item of itemsQuery.data ?? []) map.set(item.id, item);
    return map;
  }, [itemsQuery.data, allLegendaryItemsQuery.data]);

  const result =
    itemsQuery.isSuccess && allArmoryQuery.isSuccess
      ? calculateRecommendations(characters, itemMap, armory, {
          starterKitMap,
          prioritiseStarterKits,
        })
      : null;

  return {
    result,
    isLoading: armoryQuery.isPending || itemsQuery.isPending || allArmoryQuery.isPending,
    isLoadingArmory: armoryQuery.isPending,
    isLoadingItems: itemsQuery.isPending && armoryQuery.isSuccess,
    error: armoryQuery.error ?? itemsQuery.error ?? allArmoryQuery.error,
    refetch: () => {
      armoryQuery.refetch();
      itemsQuery.refetch();
      allArmoryQuery.refetch();
    },
  };
}
