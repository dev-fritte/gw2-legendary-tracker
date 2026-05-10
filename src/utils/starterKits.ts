import type { WeaponType } from "@/types/gw2-api";

/**
 * Maps each Legendary Weapon Starter Kit item ID to the weapon types it can unlock.
 * Each kit lets the player choose ONE of the listed weapons, so all listed
 * weapon types count as "craftable via this kit".
 */
export const STARTER_KIT_WEAPONS: Record<number, WeaponType[]> = {
  96054:  ["Scepter", "Staff", "Sword", "Pistol"],           // Set 1
  101123: ["Sword",   "Pistol", "Mace", "Rifle"],            // Set 2
  101623: ["Mace",    "Rifle",  "ShortBow", "Axe"],          // Set 3
  101938: ["ShortBow","Axe",   "Hammer",   "Dagger"],        // Set 4
  102946: ["Hammer",  "Dagger","Speargun", "Greatsword"],    // Set 5
  103839: ["Speargun","Greatsword","Warhorn","LongBow"],      // Set 6
  104004: ["Harpoon", "Focus", "LongBow",  "Warhorn"],       // Set 7
  103827: ["Harpoon", "Focus", "Greatsword","Torch"],        // Set 8
  103821: ["Trident", "Shield","Greatsword","Torch"],        // Set 9
  103847: ["Trident", "Shield","Scepter",  "Staff"],         // Set 10
};

export const STARTER_KIT_IDS = new Set(Object.keys(STARTER_KIT_WEAPONS).map(Number));

/**
 * Given a list of owned kit IDs, returns a map of WeaponType → count of
 * kits that cover that weapon type.  A count > 0 means the player has at
 * least one kit ready for that weapon type.
 */
export function buildStarterKitMap(ownedKitIds: number[]): Map<WeaponType, number> {
  const result = new Map<WeaponType, number>();
  for (const id of ownedKitIds) {
    const weapons = STARTER_KIT_WEAPONS[id];
    if (!weapons) continue;
    for (const wt of weapons) {
      result.set(wt, (result.get(wt) ?? 0) + 1);
    }
  }
  return result;
}
