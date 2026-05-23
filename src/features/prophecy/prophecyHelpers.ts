import type { TFunction } from 'i18next';
import type { LegendaryPickerItem } from './useAllLegendaryItems';
import type { Step, StepStatus } from './prophecyTypes';
import { GOLD, PURPLE, PURPLE_DEEP } from './prophecyTypes';

// ─── Step status ──────────────────────────────────────────────────────────────
export function stepStatus(step: Step, steps: Step[]): StepStatus {
  if (step.done) return 'done';
  if (!step.item) return 'empty';
  const firstActive = steps.find((s) => !s.done && s.item);
  return firstActive?.id === step.id ? 'active' : 'planned';
}

// ─── Orb colour palette ───────────────────────────────────────────────────────
export function orbColor(status: StepStatus): { color: string; deep: string } {
  if (status === 'done') return { color: GOLD, deep: '#7a5b1a' };
  if (status === 'empty') return { color: '#3a2a4a', deep: '#1a1224' };
  if (status === 'active') return { color: PURPLE, deep: PURPLE_DEEP };
  return { color: '#6a4d8a', deep: '#3a2050' };
}

// ─── Sub-label for picker / chronicle cards ───────────────────────────────────
export function getSubLabel(item: LegendaryPickerItem, t: TFunction): string {
  const dt = item.detailType;
  if (!dt) return '';
  switch (item.itemType) {
    case 'Weapon':
      return String(t(`weapons.${dt}`, { defaultValue: dt }));
    case 'Armor': {
      const weight = String(t(`armorTypes.${dt}`, { defaultValue: dt }));
      const mode =
        item.generation === 'armor_pve'
          ? 'Open World'
          : item.generation === 'armor_raids'
            ? 'Raids'
            : item.generation === 'armor_pvp'
              ? 'PvP'
              : item.generation === 'armor_wvw'
                ? 'WvW'
                : '';
      return mode ? `${weight} · ${mode}` : weight;
    }
    case 'Trinket':
      return String(t(`trinketTypes.${dt}`, { defaultValue: dt }));
    case 'UpgradeComponent':
      return String(t(`upgradeTypes.${dt}`, { defaultValue: dt }));
    default:
      return dt;
  }
}
