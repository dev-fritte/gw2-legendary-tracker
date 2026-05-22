import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '@/services/apiClient';
import type { WeaponType } from '@/types/gw2-api';

export interface ArmoryStatus {
  /** Item IDs of legendaries the account has unlocked (count > 0). */
  unlockedItemIds: Set<number>;
  /** Weapon types covered by at least one legendary in the armory. */
  coveredWeaponTypes: Set<WeaponType>;
}

export function useArmoryStatus(apiKey: string): ArmoryStatus & { isLoading: boolean } {
  // Same query keys as useLegendaryOverview — fully shared cache
  const accountArmoryQuery = useQuery({
    queryKey: ['legendaryArmory', 'account', apiKey],
    queryFn: () => getApiClient(apiKey).getLegendaryArmory(),
    staleTime: 5 * 60 * 1000,
  });

  const allArmoryQuery = useQuery({
    queryKey: ['legendaryArmory', 'all'],
    queryFn: () => getApiClient(apiKey).getAllLegendaryArmory(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const allIds = useMemo(() => (allArmoryQuery.data ?? []).map((e) => e.id), [allArmoryQuery.data]);

  const itemsQuery = useQuery({
    queryKey: ['items', allIds],
    queryFn: () => getApiClient(apiKey).getItems(allIds),
    enabled: allIds.length > 0,
    staleTime: 60 * 60 * 1000,
  });

  const status = useMemo((): ArmoryStatus => {
    const unlockedItemIds = new Set<number>();
    const coveredWeaponTypes = new Set<WeaponType>();

    const accountMap = new Map<number, number>(
      (accountArmoryQuery.data ?? []).map((e) => [e.id, e.count])
    );

    for (const item of itemsQuery.data ?? []) {
      if (item.type !== 'Weapon') continue;
      if ((accountMap.get(item.id) ?? 0) === 0) continue;
      unlockedItemIds.add(item.id);
      const wt = item.details?.type as WeaponType | undefined;
      if (wt) coveredWeaponTypes.add(wt);
    }

    return { unlockedItemIds, coveredWeaponTypes };
  }, [accountArmoryQuery.data, itemsQuery.data]);

  return {
    ...status,
    isLoading:
      accountArmoryQuery.isPending ||
      allArmoryQuery.isPending ||
      (allIds.length > 0 && itemsQuery.isPending),
  };
}
