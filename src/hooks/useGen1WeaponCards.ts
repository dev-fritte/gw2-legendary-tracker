import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '@/services/apiClient';
import type { WeaponType } from '@/types/gw2-api';
import { GEN1_IDS } from '@/utils/legendaryGenerations';

export interface WeaponCardInfo {
  id: number;
  name: string;
  icon: string;
}

export function useGen1WeaponCards(
  apiKey: string,
  lang: string
): {
  weaponCardMap: Map<WeaponType, WeaponCardInfo>;
  isLoading: boolean;
} {
  const armoryQuery = useQuery({
    queryKey: ['legendaryArmory', 'all'],
    queryFn: () => getApiClient(apiKey).getAllLegendaryArmory(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const allIds = useMemo(() => (armoryQuery.data ?? []).map((e) => e.id), [armoryQuery.data]);

  // Separate key from the language-neutral ['items', allIds] cache used by other hooks
  const itemsQuery = useQuery({
    queryKey: ['items', 'cards', allIds, lang],
    queryFn: () => getApiClient(apiKey).getItems(allIds, lang),
    enabled: allIds.length > 0,
    staleTime: 60 * 60 * 1000,
  });

  const weaponCardMap = useMemo((): Map<WeaponType, WeaponCardInfo> => {
    const map = new Map<WeaponType, WeaponCardInfo>();
    if (!itemsQuery.data) return map;

    for (const item of itemsQuery.data) {
      if (item.type !== 'Weapon') continue;
      if (!GEN1_IDS.has(item.id)) continue;
      const weaponType = item.details?.type as WeaponType | undefined;
      if (!weaponType) continue;
      if (!map.has(weaponType)) {
        map.set(weaponType, { id: item.id, name: item.name, icon: item.icon });
      }
    }
    return map;
  }, [itemsQuery.data]);

  return {
    weaponCardMap,
    isLoading: armoryQuery.isPending || (allIds.length > 0 && itemsQuery.isPending),
  };
}
