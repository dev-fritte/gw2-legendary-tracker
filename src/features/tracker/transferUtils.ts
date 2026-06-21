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
      .map((it) => ({ id: it.id, name: it.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (matching.length === 0) return [];

    return [
      {
        id: rec.weaponType,
        weaponType: rec.weaponType,
        impact: rec.impact,
        recIcon: rec.icon,
        availableOptions: matching,
        selectedId: matching[0].id,
      },
    ];
  });
}
