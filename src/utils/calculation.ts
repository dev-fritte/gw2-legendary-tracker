import type {
  Character,
  GW2Item,
  LegendaryArmoryItem,
  WeaponType,
  LegendaryWeaponRecommendation,
} from "@/types/gw2-api";

export interface CalculationOptions {
  /** Weapon types → kit count map from useStarterKits. Empty map = disabled. */
  starterKitMap?: Map<WeaponType, number>;
  /** When true, weapons with starter kits sort above weapons without. */
  prioritiseStarterKits?: boolean;
}

const WEAPON_SLOTS = new Set([
  "WeaponA1",
  "WeaponA2",
  "WeaponB1",
  "WeaponB2",
]);

export interface AnalysisResult {
  recommendations: LegendaryWeaponRecommendation[];
  coveredByArmory: LegendaryWeaponRecommendation[];
}

interface WeaponTypeAccumulator {
  allChars: LegendaryWeaponRecommendation["affectedCharacters"];
  hasEquippedLegendary: boolean;
  icon: string | undefined;
  sampleItemId: number | undefined;
}

export function calculateRecommendations(
  characters: Character[],
  itemMap: Map<number, GW2Item>,
  armory: LegendaryArmoryItem[],
  { starterKitMap = new Map(), prioritiseStarterKits = true }: CalculationOptions = {},
): AnalysisResult {
  // Build map: weaponType → count of legendaries in armory
  const armoryByWeaponType = new Map<WeaponType, number>();
  for (const entry of armory) {
    const item = itemMap.get(entry.id);
    if (item?.type === "Weapon" && item.details?.type) {
      const wt = item.details.type as WeaponType;
      armoryByWeaponType.set(wt, (armoryByWeaponType.get(wt) ?? 0) + entry.count);
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
      if (!item || item.type !== "Weapon" || !item.details?.type) continue;

      const weaponType = item.details.type as WeaponType;
      const isLegendary = item.rarity === "Legendary";
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
          slot: eq.slot as LegendaryWeaponRecommendation["affectedCharacters"][number]["slot"],
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

    // "Covered" = armory has a legendary of this type OR at least one slot
    // already has a legendary equipped (old-style, pre-armory legendaries).
    if (armoryCount > 0 || acc.hasEquippedLegendary) {
      coveredByArmory.push(rec);
    } else {
      // Only recommend if there are actually non-legendary slots to improve
      if (impact > 0) recommendations.push(rec);
    }
  }

  const byImpact = (
    a: LegendaryWeaponRecommendation,
    b: LegendaryWeaponRecommendation,
  ) => {
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

/** Collect all unique item IDs needed for an analysis run */
export function collectItemIds(
  characters: Character[],
  armory: LegendaryArmoryItem[],
): number[] {
  const ids = new Set<number>();
  for (const char of characters) {
    for (const eq of char.equipment) {
      if (WEAPON_SLOTS.has(eq.slot)) ids.add(eq.id);
    }
  }
  for (const entry of armory) ids.add(entry.id);
  return [...ids];
}
