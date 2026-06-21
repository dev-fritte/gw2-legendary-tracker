import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getApiClient } from '@/services/apiClient';
import type { GW2Item, LegendaryArmoryItem } from '@/types/gw2-api';

export interface LegendaryGridItem {
  id: number;
  name: string;
  icon: string;
  description?: string;
  count: number;
  maxCount: number;
  itemType: string;
  /** Weapon type for weapons, armor slot for armor — from GW2 item details */
  detailType?: string;
  /** Armor weight class (Heavy/Medium/Light/Clothing) */
  weightClass?: string;
}

function useAllLegendaryArmory(apiKey: string) {
  return useQuery({
    queryKey: ['legendaryArmory', 'all'],
    queryFn: () => getApiClient(apiKey).getAllLegendaryArmory(),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

function useAccountArmory(apiKey: string) {
  return useQuery({
    queryKey: ['legendaryArmory', 'account', apiKey],
    queryFn: (): Promise<LegendaryArmoryItem[]> => getApiClient(apiKey).getLegendaryArmory(),
    staleTime: 5 * 60 * 1000,
  });
}

function useItems(apiKey: string, ids: number[], enabled: boolean, lang: string) {
  return useQuery({
    queryKey: ['items', ids, lang],
    queryFn: () => getApiClient(apiKey).getItems(ids, lang),
    enabled: enabled && ids.length > 0,
    staleTime: 60 * 60 * 1000,
  });
}

export function useLegendaryOverview(apiKey: string) {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('de') ? 'de' : 'en';
  const allQuery = useAllLegendaryArmory(apiKey);
  const accountQuery = useAccountArmory(apiKey);

  const allIds = (allQuery.data ?? []).map((e) => e.id);
  const itemsReady = allQuery.isSuccess && accountQuery.isSuccess;
  const itemsQuery = useItems(apiKey, allIds, itemsReady, lang);

  const accountMap = new Map<number, number>((accountQuery.data ?? []).map((e) => [e.id, e.count]));
  const maxCountMap = new Map<number, number>(
    (allQuery.data ?? []).map((e) => [e.id, e.max_count])
  );

  const items: LegendaryGridItem[] = (itemsQuery.data ?? [])
    .map((item: GW2Item) => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      description: item.description,
      count: accountMap.get(item.id) ?? 0,
      maxCount: maxCountMap.get(item.id) ?? 1,
      itemType: item.type,
      detailType: item.details?.type,
      weightClass: item.details?.weight_class,
    }))
    .sort((a, b) => {
      if (a.count > 0 && b.count === 0) return -1;
      if (a.count === 0 && b.count > 0) return 1;
      return a.name.localeCompare(b.name);
    });

  return {
    items,
    isLoading: allQuery.isPending || accountQuery.isPending || itemsQuery.isPending,
    isLoadingItems: itemsReady && itemsQuery.isPending,
    error: allQuery.error ?? accountQuery.error ?? itemsQuery.error,
    unlockedCount: items.filter((i) => i.count > 0).length,
    totalCount: items.length,
    refetch: () => {
      allQuery.refetch();
      accountQuery.refetch();
      itemsQuery.refetch();
    },
  };
}
