import type { LegendaryPickerItem } from '@/features/prophecy/useAllLegendaryItems';
import type { LegendaryWeaponRecommendation } from '@/types/gw2-api';
import type { TransferEntry } from './transferTypes';

export function buildEntries(
  recommendations: LegendaryWeaponRecommendation[],
  allItems: LegendaryPickerItem[],
): TransferEntry[] {
  return recommendations.flatMap((rec): TransferEntry[] => {
    const matching = allItems
      .filter((it) => it.itemType === 'Weapon' && it.detailType === rec.weaponType)
      .map((it) => it.name)
      .sort((a, b) => a.localeCompare(b));

    if (matching.length === 0) return [];

    return [
      {
        id: rec.weaponType,
        weaponType: rec.weaponType,
        impact: rec.impact,
        recIcon: rec.icon,
        availableNames: matching,
        selectedName: matching[0],
      },
    ];
  });
}
