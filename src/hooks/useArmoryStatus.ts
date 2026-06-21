import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getApiClient } from '@/services/apiClient';
import type { WeaponType } from '@/types/gw2-api';
import { DUAL_WIELD_WEAPON_TYPES } from '@/utils/weaponProperties';

export { DUAL_WIELD_WEAPON_TYPES };

export interface ArmoryStatus {
  /** Item IDs of legendaries the account has unlocked (count ≥ 1). */
  unlockedItemIds: Set<number>;
  /**
   * Weapon types fully covered by the armory:
   * - Non-dual-wield types: ≥ 1 copy in armory.
   * - Dual-wield types: ≥ 2 copies in armory (so both slots are filled).
   */
  coveredWeaponTypes: Set<WeaponType>;
  /**
   * Dual-wield weapon types where the armory has exactly 1 copy — one slot
   * is covered, but a second legendary would fill the other slot too.
   */
  partiallyCoveredWeaponTypes: Set<WeaponType>;
}

export function useArmoryStatus(apiKey: string): ArmoryStatus & { isLoading: boolean } {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('de') ? 'de' : 'en';
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
    queryKey: ['items', allIds, lang],
    queryFn: () => getApiClient(apiKey).getItems(allIds, lang),
    enabled: allIds.length > 0,
    staleTime: 60 * 60 * 1000,
  });

  const status = useMemo((): ArmoryStatus => {
    const unlockedItemIds = new Set<number>();
    const coveredWeaponTypes = new Set<WeaponType>();
    const partiallyCoveredWeaponTypes = new Set<WeaponType>();

    const accountMap = new Map<number, number>(
      (accountArmoryQuery.data ?? []).map((e) => [e.id, e.count])
    );

    // Tally total legendary copies per weapon type across all item IDs.
    // (e.g. 1× Twilight + 1× Dusk both contribute to Greatsword count)
    const countByWeaponType = new Map<WeaponType, number>();
    for (const item of itemsQuery.data ?? []) {
      const count = accountMap.get(item.id) ?? 0;
      if (count === 0) continue;
      unlockedItemIds.add(item.id);
      if (item.type !== 'Weapon') continue;
      const wt = item.details?.type as WeaponType | undefined;
      if (wt) countByWeaponType.set(wt, (countByWeaponType.get(wt) ?? 0) + count);
    }

    for (const [wt, count] of countByWeaponType) {
      if (DUAL_WIELD_WEAPON_TYPES.has(wt)) {
        // Dual-wield types need 2 copies for full coverage
        if (count >= 2) coveredWeaponTypes.add(wt);
        else partiallyCoveredWeaponTypes.add(wt);
      } else {
        // Two-handed / off-hand-only weapons: 1 copy is enough
        coveredWeaponTypes.add(wt);
      }
    }

    return { unlockedItemIds, coveredWeaponTypes, partiallyCoveredWeaponTypes };
  }, [accountArmoryQuery.data, itemsQuery.data]);

  return {
    ...status,
    isLoading:
      accountArmoryQuery.isPending ||
      allArmoryQuery.isPending ||
      (allIds.length > 0 && itemsQuery.isPending),
  };
}
