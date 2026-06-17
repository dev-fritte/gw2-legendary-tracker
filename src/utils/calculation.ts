import type {
  Character,
  GW2Item,
  LegendaryArmoryItem,
  LegendaryTrinketRecommendation,
  LegendaryWeaponRecommendation,
  TrinketSlot,
  TrinketSlotType,
  WeaponType,
} from '@/types/gw2-api';
import { DUAL_WIELD_WEAPON_TYPES } from '@/utils/weaponProperties';
import {
  ALL_TRINKET_SLOT_TYPES,
  DUAL_TRINKET_SLOT_TYPES,
  SLOT_TO_TRINKET_TYPE,
  TRINKET_SLOTS,
} from '@/utils/trinketProperties';

export interface CalculationOptions {
  /** Weapon types → kit count map from useStarterKits. Empty map = disabled. */
  starterKitMap?: Map<WeaponType, number>;
  /** When true, weapons with starter kits sort above weapons without. */
  prioritiseStarterKits?: boolean;
}

const WEAPON_SLOTS = new Set(['WeaponA1', 'WeaponA2', 'WeaponB1', 'WeaponB2']);

const ALL_WEAPON_TYPES: WeaponType[] = [
  'Axe',
  'Dagger',
  'Mace',
  'Pistol',
  'Scepter',
  'Sword',
  'Focus',
  'Shield',
  'Torch',
  'Warhorn',
  'Greatsword',
  'Hammer',
  'LongBow',
  'Rifle',
  'ShortBow',
  'Staff',
  'Harpoon',
  'Speargun',
  'Trident',
];

export interface AnalysisResult {
  recommendations: LegendaryWeaponRecommendation[];
  coveredByArmory: LegendaryWeaponRecommendation[];
}

interface WeaponTypeAccumulator {
  allChars: LegendaryWeaponRecommendation['affectedCharacters'];
  hasEquippedLegendary: boolean;
  icon: string | undefined;
  sampleItemId: number | undefined;
}

export function calculateRecommendations(
  characters: Character[],
  itemMap: Map<number, GW2Item>,
  armory: LegendaryArmoryItem[],
  { starterKitMap = new Map(), prioritiseStarterKits = true }: CalculationOptions = {}
): AnalysisResult {
  // Build map: weaponType → count of legendaries in armory
  // Also track an icon/id per type for weapon types not equipped by any character.
  const armoryByWeaponType = new Map<WeaponType, number>();
  const armoryIconByWeaponType = new Map<WeaponType, { icon: string; id: number }>();
  for (const entry of armory) {
    const item = itemMap.get(entry.id);
    if (item?.type === 'Weapon' && item.details?.type) {
      const wt = item.details.type as WeaponType;
      armoryByWeaponType.set(wt, (armoryByWeaponType.get(wt) ?? 0) + entry.count);
      if (!armoryIconByWeaponType.has(wt)) {
        armoryIconByWeaponType.set(wt, { icon: item.icon, id: item.id });
      }
    }
  }

  // Walk ALL weapon slots — track legendary and non-legendary separately.
  // We no longer skip legendary-equipped slots so that weapon types covered
  // by the armory or already equipped still appear in the "already have" section.
  const usageMap = new Map<WeaponType, WeaponTypeAccumulator>();

  for (const char of characters) {
    // The GW2 API (v=2019-12-19) returns one entry per unique (item, slot)
    // combination. The `tabs` array lists every equipment-template tab that
    // uses this item in this slot.  We must count each tab individually —
    // that is what the user sees as "X slots".
    for (const eq of char.equipment) {
      if (!WEAPON_SLOTS.has(eq.slot)) continue;

      const item = itemMap.get(eq.id);
      if (!item || item.type !== 'Weapon' || !item.details?.type) continue;

      const weaponType = item.details.type as WeaponType;
      const isLegendary = item.rarity === 'Legendary';
      // How many template tabs use this item in this slot?
      const tabCount = eq.tabs?.length ?? 1;

      const acc = usageMap.get(weaponType) ?? {
        allChars: [],
        hasEquippedLegendary: false,
        icon: item.icon,
        sampleItemId: item.id,
      };

      // Push one entry per template tab so the impact counter is correct.
      for (let i = 0; i < tabCount; i++) {
        acc.allChars.push({
          name: char.name,
          profession: char.profession,
          slot: eq.slot as LegendaryWeaponRecommendation['affectedCharacters'][number]['slot'],
          isLegendary,
        });
      }

      if (isLegendary) acc.hasEquippedLegendary = true;

      // Prefer an icon from a non-legendary item (more recognisable art)
      if (!isLegendary && !acc.icon) {
        acc.icon = item.icon;
        acc.sampleItemId = item.id;
      }

      usageMap.set(weaponType, acc);
    }
  }

  // Ensure every weapon type appears in the results, even if no character has it equipped.
  // Build a lookup from itemMap for any weapon type not already covered by the owned armory.
  const itemMapIconByWeaponType = new Map<WeaponType, { icon: string; id: number }>();
  for (const [id, item] of itemMap) {
    if (item.type !== 'Weapon' || !item.details?.type) continue;
    const wt = item.details.type as WeaponType;
    if (!itemMapIconByWeaponType.has(wt)) {
      itemMapIconByWeaponType.set(wt, { icon: item.icon, id });
    }
  }

  for (const wt of ALL_WEAPON_TYPES) {
    if (!usageMap.has(wt)) {
      const info = armoryIconByWeaponType.get(wt) ?? itemMapIconByWeaponType.get(wt);
      usageMap.set(wt, {
        allChars: [],
        hasEquippedLegendary: false,
        icon: info?.icon,
        sampleItemId: info?.id,
      });
    }
  }

  const recommendations: LegendaryWeaponRecommendation[] = [];
  const coveredByArmory: LegendaryWeaponRecommendation[] = [];

  for (const [weaponType, acc] of usageMap.entries()) {
    const armoryCount = armoryByWeaponType.get(weaponType) ?? 0;
    // Impact = only non-legendary slots (slots that would actually benefit)
    const nonLegendarySlots = acc.allChars.filter((c) => !c.isLegendary);
    const impact = nonLegendarySlots.length;

    const rec: LegendaryWeaponRecommendation = {
      weaponType,
      impact,
      affectedCharacters: acc.allChars,
      existingLegendaryCount: armoryCount,
      hasEquippedLegendary: acc.hasEquippedLegendary,
      starterKitCount: starterKitMap.get(weaponType) ?? 0,
      icon: acc.icon,
      sampleItemId: acc.sampleItemId,
    };

    // Determine whether this weapon type is fully covered and should move to
    // the "already have" section rather than "craft next".
    //
    // Dual-wield types (Axe, Dagger, Mace, Pistol, Sword) need 2 legendary
    // copies to fill both slots simultaneously in the same equipment template.
    // hasEquippedLegendary is intentionally excluded for these types because
    // it is usually set by the 1 armory copy the user already equipped — it
    // does NOT mean the second slot is covered.
    //
    // Covered when:
    //   dual-wield  →  all slots are already legendary (impact=0)
    //                  OR 2+ copies in the armory
    //   everything else → at least 1 armory copy OR any slot has a legendary
    const isDualWield = DUAL_WIELD_WEAPON_TYPES.has(weaponType);
    const isCovered = isDualWield
      ? impact === 0 || armoryCount >= 2
      : armoryCount > 0 || acc.hasEquippedLegendary;

    if (isCovered) {
      coveredByArmory.push(rec);
    } else {
      recommendations.push(rec);
    }
  }

  const byImpact = (a: LegendaryWeaponRecommendation, b: LegendaryWeaponRecommendation) => {
    // When starter-kit prioritisation is active, weapons with at least one
    // owned kit rank above those without, regardless of raw impact.
    if (prioritiseStarterKits) {
      const kitDiff = (b.starterKitCount > 0 ? 1 : 0) - (a.starterKitCount > 0 ? 1 : 0);
      if (kitDiff !== 0) return kitDiff;
    }
    return b.impact - a.impact || a.weaponType.localeCompare(b.weaponType);
  };

  recommendations.sort(byImpact);
  coveredByArmory.sort(byImpact);

  return { recommendations, coveredByArmory };
}

/** Collect all unique item IDs needed for an analysis run (weapons + trinkets/back) */
export function collectItemIds(characters: Character[], armory: LegendaryArmoryItem[]): number[] {
  const ids = new Set<number>();
  for (const char of characters) {
    for (const eq of char.equipment) {
      if (WEAPON_SLOTS.has(eq.slot) || TRINKET_SLOTS.has(eq.slot)) ids.add(eq.id);
    }
  }
  for (const entry of armory) ids.add(entry.id);
  return [...ids];
}

// ─── Trinket & Back analysis ──────────────────────────────────────────────────

interface TrinketAccumulator {
  allChars: LegendaryTrinketRecommendation['affectedCharacters'];
  hasEquippedLegendary: boolean;
  icon: string | undefined;
  sampleItemId: number | undefined;
}

export interface TrinketAnalysisResult {
  recommendations: LegendaryTrinketRecommendation[];
  coveredByArmory: LegendaryTrinketRecommendation[];
}

export function calculateTrinketRecommendations(
  characters: Character[],
  itemMap: Map<number, GW2Item>,
  armory: LegendaryArmoryItem[],
): TrinketAnalysisResult {
  // Build armory map: TrinketSlotType → legendary count + icon
  const armoryBySlotType = new Map<TrinketSlotType, number>();
  const armoryIconBySlotType = new Map<TrinketSlotType, { icon: string; id: number }>();

  for (const entry of armory) {
    const item = itemMap.get(entry.id);
    if (!item) continue;

    let slotType: TrinketSlotType | null = null;
    if (item.type === 'Back') {
      slotType = 'Back';
    } else if (item.type === 'Trinket' && item.details?.type) {
      const dt = item.details.type;
      if (dt === 'Amulet' || dt === 'Ring' || dt === 'Accessory') slotType = dt as TrinketSlotType;
    }
    if (!slotType) continue;

    armoryBySlotType.set(slotType, (armoryBySlotType.get(slotType) ?? 0) + entry.count);
    if (!armoryIconBySlotType.has(slotType))
      armoryIconBySlotType.set(slotType, { icon: item.icon, id: item.id });
  }

  // Walk all trinket/back equipment slots
  const usageMap = new Map<TrinketSlotType, TrinketAccumulator>();

  for (const char of characters) {
    for (const eq of char.equipment) {
      const slotType = SLOT_TO_TRINKET_TYPE[eq.slot];
      if (!slotType) continue;

      const item = itemMap.get(eq.id);
      if (!item) continue;

      const isLegendary = item.rarity === 'Legendary';
      const tabCount = eq.tabs?.length ?? 1;

      const acc: TrinketAccumulator = usageMap.get(slotType) ?? {
        allChars: [],
        hasEquippedLegendary: false,
        icon: undefined,
        sampleItemId: undefined,
      };

      for (let i = 0; i < tabCount; i++) {
        acc.allChars.push({
          name: char.name,
          profession: char.profession,
          slot: eq.slot as TrinketSlot,
          isLegendary,
        });
      }

      if (isLegendary) acc.hasEquippedLegendary = true;
      if (!isLegendary && !acc.icon) {
        acc.icon = item.icon;
        acc.sampleItemId = item.id;
      }

      usageMap.set(slotType, acc);
    }
  }

  // Ensure every slot type appears, using armory/itemMap icons as fallback
  const itemMapIconBySlotType = new Map<TrinketSlotType, { icon: string; id: number }>();
  for (const [id, item] of itemMap) {
    let slotType: TrinketSlotType | null = null;
    if (item.type === 'Back') slotType = 'Back';
    else if (item.type === 'Trinket' && item.details?.type) {
      const dt = item.details.type;
      if (dt === 'Amulet' || dt === 'Ring' || dt === 'Accessory') slotType = dt as TrinketSlotType;
    }
    if (slotType && !itemMapIconBySlotType.has(slotType))
      itemMapIconBySlotType.set(slotType, { icon: item.icon, id });
  }

  for (const slotType of ALL_TRINKET_SLOT_TYPES) {
    if (!usageMap.has(slotType)) {
      const info = armoryIconBySlotType.get(slotType) ?? itemMapIconBySlotType.get(slotType);
      usageMap.set(slotType, {
        allChars: [],
        hasEquippedLegendary: false,
        icon: info?.icon,
        sampleItemId: info?.id,
      });
    }
  }

  const recommendations: LegendaryTrinketRecommendation[] = [];
  const coveredByArmory: LegendaryTrinketRecommendation[] = [];

  for (const [slotType, acc] of usageMap.entries()) {
    const armoryCount = armoryBySlotType.get(slotType) ?? 0;
    const impact = acc.allChars.filter((c) => !c.isLegendary).length;

    const rec: LegendaryTrinketRecommendation = {
      slotType,
      impact,
      affectedCharacters: acc.allChars,
      existingLegendaryCount: armoryCount,
      hasEquippedLegendary: acc.hasEquippedLegendary,
      icon: acc.icon,
      sampleItemId: acc.sampleItemId,
    };

    const isDual = DUAL_TRINKET_SLOT_TYPES.has(slotType);
    const isCovered = isDual
      ? impact === 0 || armoryCount >= 2
      : armoryCount > 0 || acc.hasEquippedLegendary;

    if (isCovered) coveredByArmory.push(rec);
    else recommendations.push(rec);
  }

  const byImpact = (a: LegendaryTrinketRecommendation, b: LegendaryTrinketRecommendation) =>
    b.impact - a.impact || a.slotType.localeCompare(b.slotType);

  recommendations.sort(byImpact);
  coveredByArmory.sort(byImpact);

  return { recommendations, coveredByArmory };
}
