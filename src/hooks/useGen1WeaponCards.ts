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
  // The legendary armory catalogue is GW2 static data — it never changes once a
  // legendary is released.  Cache indefinitely for the lifetime of the tab.
  const armoryQuery = useQuery({
    queryKey: ['legendaryArmory', 'all'],
    queryFn: () => getApiClient(apiKey).getAllLegendaryArmory(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const allIds = useMemo(() => (armoryQuery.data ?? []).map((e) => e.id), [armoryQuery.data]);

  // Item details (name, icon, description) are also static GW2 data.
  // The lang suffix ensures the correct locale is cached independently.
  const itemsQuery = useQuery({
    queryKey: ['items', 'cards', allIds, lang],
    queryFn: () => getApiClient(apiKey).getItems(allIds, lang),
    enabled: allIds.length > 0,
    staleTime: Infinity,
    gcTime: Infinity,
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
