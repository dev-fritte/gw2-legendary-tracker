import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/services/apiClient";
import { calculateRecommendations, collectItemIds } from "@/utils/calculation";
import type { Character, GW2Item, LegendaryArmoryItem } from "@/types/gw2-api";

function useArmory(apiKey: string) {
  return useQuery({
    queryKey: ["legendaryArmory", apiKey],
    queryFn: (): Promise<LegendaryArmoryItem[]> =>
      getApiClient(apiKey).getLegendaryArmory(),
    staleTime: 5 * 60 * 1000,
  });
}

function useItems(apiKey: string, ids: number[], enabled: boolean) {
  return useQuery({
    queryKey: ["items", ids],
    queryFn: async (): Promise<GW2Item[]> =>
      getApiClient(apiKey).getItems(ids),
    enabled: enabled && ids.length > 0,
    staleTime: 60 * 60 * 1000, // item data rarely changes
  });
}

export function useWeaponAnalysis(apiKey: string, characters: Character[]) {
  const armoryQuery = useArmory(apiKey);
  const armory = armoryQuery.data ?? [];

  const itemIds = armoryQuery.isSuccess
    ? collectItemIds(characters, armory)
    : [];

  const itemsQuery = useItems(apiKey, itemIds, armoryQuery.isSuccess);

  const itemMap = new Map<number, GW2Item>(
    (itemsQuery.data ?? []).map((item) => [item.id, item]),
  );

  const result =
    itemsQuery.isSuccess
      ? calculateRecommendations(characters, itemMap, armory)
      : null;

  return {
    result,
    isLoading: armoryQuery.isPending || itemsQuery.isPending,
    isLoadingArmory: armoryQuery.isPending,
    isLoadingItems: itemsQuery.isPending && armoryQuery.isSuccess,
    error: armoryQuery.error ?? itemsQuery.error,
    refetch: () => { armoryQuery.refetch(); itemsQuery.refetch(); },
  };
}
