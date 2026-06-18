import type { ArmorWeight } from './professionArmorWeight';
import type { ArmorMode, ArmorSlotType } from './armorProperties';

interface ArmorEntry {
  slot: ArmorSlotType;
  weight: ArmorWeight;
  mode: ArmorMode;
}

// All legendary armor item IDs mapped to slot, weight class, and game mode.
// Sources:
//   pve  = Obsidian armor (crafted, SotO era)            IDs: 101xxx
//   raid = Perfected Envoy armor (raid progression)       IDs: 80xxx
//   pvp  = Glorious Hero's / Ardent Glorious / Mistforged Glorious Hero's
//   wvw  = Triumphant Hero's / Mistforged Triumphant Hero's
export const LEGENDARY_ARMOR_DATA: ReadonlyMap<number, ArmorEntry> = new Map<number, ArmorEntry>([
  // ── PvE · Obsidian ───────────────────────────────────────────────────────
  [101516, { slot: 'Helm',      weight: 'Light',  mode: 'pve' }],
  [101462, { slot: 'Shoulders', weight: 'Light',  mode: 'pve' }],
  [101499, { slot: 'Coat',      weight: 'Light',  mode: 'pve' }],
  [101536, { slot: 'Gloves',    weight: 'Light',  mode: 'pve' }],
  [101501, { slot: 'Leggings',  weight: 'Light',  mode: 'pve' }],
  [101535, { slot: 'Boots',     weight: 'Light',  mode: 'pve' }],
  [101614, { slot: 'Helm',      weight: 'Medium', mode: 'pve' }],
  [101645, { slot: 'Shoulders', weight: 'Medium', mode: 'pve' }],
  [101556, { slot: 'Coat',      weight: 'Medium', mode: 'pve' }],
  [101570, { slot: 'Gloves',    weight: 'Medium', mode: 'pve' }],
  [101579, { slot: 'Leggings',  weight: 'Medium', mode: 'pve' }],
  [101602, { slot: 'Boots',     weight: 'Medium', mode: 'pve' }],
  [101544, { slot: 'Helm',      weight: 'Heavy',  mode: 'pve' }],
  [101551, { slot: 'Shoulders', weight: 'Heavy',  mode: 'pve' }],
  [101521, { slot: 'Coat',      weight: 'Heavy',  mode: 'pve' }],
  [101609, { slot: 'Gloves',    weight: 'Heavy',  mode: 'pve' }],
  [101568, { slot: 'Leggings',  weight: 'Heavy',  mode: 'pve' }],
  [101460, { slot: 'Boots',     weight: 'Heavy',  mode: 'pve' }],
  // Eikasia, Mists-Grasper (SotO standalone gloves, pve)
  [105317, { slot: 'Gloves', weight: 'Light',  mode: 'pve' }],
  [105293, { slot: 'Gloves', weight: 'Medium', mode: 'pve' }],
  [105171, { slot: 'Gloves', weight: 'Heavy',  mode: 'pve' }],

  // ── Raid · Perfected Envoy ───────────────────────────────────────────────
  [80248, { slot: 'Helm',      weight: 'Light',  mode: 'raid' }],
  [80131, { slot: 'Shoulders', weight: 'Light',  mode: 'raid' }],
  [80190, { slot: 'Coat',      weight: 'Light',  mode: 'raid' }],
  [80111, { slot: 'Gloves',    weight: 'Light',  mode: 'raid' }],
  [80356, { slot: 'Leggings',  weight: 'Light',  mode: 'raid' }],
  [80399, { slot: 'Boots',     weight: 'Light',  mode: 'raid' }],
  [80296, { slot: 'Helm',      weight: 'Medium', mode: 'raid' }],
  [80145, { slot: 'Shoulders', weight: 'Medium', mode: 'raid' }],
  [80578, { slot: 'Coat',      weight: 'Medium', mode: 'raid' }],
  [80161, { slot: 'Gloves',    weight: 'Medium', mode: 'raid' }],
  [80252, { slot: 'Leggings',  weight: 'Medium', mode: 'raid' }],
  [80281, { slot: 'Boots',     weight: 'Medium', mode: 'raid' }],
  [80384, { slot: 'Helm',      weight: 'Heavy',  mode: 'raid' }],
  [80435, { slot: 'Shoulders', weight: 'Heavy',  mode: 'raid' }],
  [80254, { slot: 'Coat',      weight: 'Heavy',  mode: 'raid' }],
  [80205, { slot: 'Gloves',    weight: 'Heavy',  mode: 'raid' }],
  [80277, { slot: 'Leggings',  weight: 'Heavy',  mode: 'raid' }],
  [80557, { slot: 'Boots',     weight: 'Heavy',  mode: 'raid' }],

  // ── PvP · Glorious Hero's (tier 1) ──────────────────────────────────────
  [82423, { slot: 'Helm',      weight: 'Light',  mode: 'pvp' }],
  [84723, { slot: 'Shoulders', weight: 'Light',  mode: 'pvp' }],
  [83729, { slot: 'Coat',      weight: 'Light',  mode: 'pvp' }],
  [84461, { slot: 'Gloves',    weight: 'Light',  mode: 'pvp' }],
  [84341, { slot: 'Leggings',  weight: 'Light',  mode: 'pvp' }],
  [84427, { slot: 'Boots',     weight: 'Light',  mode: 'pvp' }],
  [82401, { slot: 'Helm',      weight: 'Medium', mode: 'pvp' }],
  [82268, { slot: 'Shoulders', weight: 'Medium', mode: 'pvp' }],
  [82098, { slot: 'Coat',      weight: 'Medium', mode: 'pvp' }],
  [83676, { slot: 'Gloves',    weight: 'Medium', mode: 'pvp' }],
  [83240, { slot: 'Leggings',  weight: 'Medium', mode: 'pvp' }],
  [82272, { slot: 'Boots',     weight: 'Medium', mode: 'pvp' }],
  [82698, { slot: 'Helm',      weight: 'Heavy',  mode: 'pvp' }],
  [84561, { slot: 'Shoulders', weight: 'Heavy',  mode: 'pvp' }],
  [82334, { slot: 'Coat',      weight: 'Heavy',  mode: 'pvp' }],
  [82410, { slot: 'Gloves',    weight: 'Heavy',  mode: 'pvp' }],
  [84748, { slot: 'Leggings',  weight: 'Heavy',  mode: 'pvp' }],
  [83957, { slot: 'Boots',     weight: 'Heavy',  mode: 'pvp' }],

  // ── PvP · Ardent Glorious (tier 2) ──────────────────────────────────────
  [84633, { slot: 'Helm',      weight: 'Light',  mode: 'pvp' }],
  [83595, { slot: 'Shoulders', weight: 'Light',  mode: 'pvp' }],
  [83113, { slot: 'Coat',      weight: 'Light',  mode: 'pvp' }],
  [83162, { slot: 'Gloves',    weight: 'Light',  mode: 'pvp' }],
  [84546, { slot: 'Leggings',  weight: 'Light',  mode: 'pvp' }],
  [82519, { slot: 'Boots',     weight: 'Light',  mode: 'pvp' }],
  [84643, { slot: 'Helm',      weight: 'Medium', mode: 'pvp' }],
  [83929, { slot: 'Shoulders', weight: 'Medium', mode: 'pvp' }],
  [82670, { slot: 'Coat',      weight: 'Medium', mode: 'pvp' }],
  [82245, { slot: 'Gloves',    weight: 'Medium', mode: 'pvp' }],
  [82512, { slot: 'Leggings',  weight: 'Medium', mode: 'pvp' }],
  [82214, { slot: 'Boots',     weight: 'Medium', mode: 'pvp' }],
  [83921, { slot: 'Helm',      weight: 'Heavy',  mode: 'pvp' }],
  [83127, { slot: 'Shoulders', weight: 'Heavy',  mode: 'pvp' }],
  [83348, { slot: 'Coat',      weight: 'Heavy',  mode: 'pvp' }],
  [82465, { slot: 'Gloves',    weight: 'Heavy',  mode: 'pvp' }],
  [83323, { slot: 'Leggings',  weight: 'Heavy',  mode: 'pvp' }],
  [84655, { slot: 'Boots',     weight: 'Heavy',  mode: 'pvp' }],

  // ── PvP · Mistforged Glorious Hero's (tier 3) ───────────────────────────
  [89260, { slot: 'Helm',      weight: 'Light',  mode: 'pvp' }],
  [89158, { slot: 'Shoulders', weight: 'Light',  mode: 'pvp' }],
  [89174, { slot: 'Coat',      weight: 'Light',  mode: 'pvp' }],
  [89167, { slot: 'Gloves',    weight: 'Light',  mode: 'pvp' }],
  [89101, { slot: 'Leggings',  weight: 'Light',  mode: 'pvp' }],
  [89245, { slot: 'Boots',     weight: 'Light',  mode: 'pvp' }],
  [89126, { slot: 'Helm',      weight: 'Medium', mode: 'pvp' }],
  [89234, { slot: 'Shoulders', weight: 'Medium', mode: 'pvp' }],
  [89183, { slot: 'Coat',      weight: 'Medium', mode: 'pvp' }],
  [89134, { slot: 'Gloves',    weight: 'Medium', mode: 'pvp' }],
  [89094, { slot: 'Leggings',  weight: 'Medium', mode: 'pvp' }],
  [89235, { slot: 'Boots',     weight: 'Medium', mode: 'pvp' }],
  [89117, { slot: 'Helm',      weight: 'Heavy',  mode: 'pvp' }],
  [89209, { slot: 'Shoulders', weight: 'Heavy',  mode: 'pvp' }],
  [89152, { slot: 'Coat',      weight: 'Heavy',  mode: 'pvp' }],
  [89093, { slot: 'Gloves',    weight: 'Heavy',  mode: 'pvp' }],
  [89266, { slot: 'Leggings',  weight: 'Heavy',  mode: 'pvp' }],
  [89252, { slot: 'Boots',     weight: 'Heavy',  mode: 'pvp' }],

  // ── WvW · Triumphant Hero's (tier 1) ────────────────────────────────────
  [82902, { slot: 'Helm',      weight: 'Light',  mode: 'wvw' }],
  [82173, { slot: 'Shoulders', weight: 'Light',  mode: 'wvw' }],
  [83036, { slot: 'Coat',      weight: 'Light',  mode: 'wvw' }],
  [84629, { slot: 'Gloves',    weight: 'Light',  mode: 'wvw' }],
  [83497, { slot: 'Leggings',  weight: 'Light',  mode: 'wvw' }],
  [83289, { slot: 'Boots',     weight: 'Light',  mode: 'wvw' }],
  [82437, { slot: 'Helm',      weight: 'Medium', mode: 'wvw' }],
  [82994, { slot: 'Shoulders', weight: 'Medium', mode: 'wvw' }],
  [84578, { slot: 'Coat',      weight: 'Medium', mode: 'wvw' }],
  [84110, { slot: 'Gloves',    weight: 'Medium', mode: 'wvw' }],
  [82903, { slot: 'Leggings',  weight: 'Medium', mode: 'wvw' }],
  // Medium Boots: ID not yet identified
  [84176, { slot: 'Helm',      weight: 'Heavy',  mode: 'wvw' }],
  [82963, { slot: 'Shoulders', weight: 'Heavy',  mode: 'wvw' }],
  [83394, { slot: 'Coat',      weight: 'Heavy',  mode: 'wvw' }],
  [82456, { slot: 'Gloves',    weight: 'Heavy',  mode: 'wvw' }],
  // Heavy Leggings: ID not yet identified
  [82801, { slot: 'Boots',     weight: 'Heavy',  mode: 'wvw' }],

  // ── WvW · Mistforged Triumphant Hero's (tier 2, incl. Sublime variants) ─
  [82925, { slot: 'Helm',      weight: 'Light',  mode: 'wvw' }],
  [83308, { slot: 'Shoulders', weight: 'Light',  mode: 'wvw' }],
  [84508, { slot: 'Coat',      weight: 'Light',  mode: 'wvw' }],
  [82109, { slot: 'Gloves',    weight: 'Light',  mode: 'wvw' }],
  [82502, { slot: 'Leggings',  weight: 'Light',  mode: 'wvw' }],
  [83482, { slot: 'Boots',     weight: 'Light',  mode: 'wvw' }],
  [82180, { slot: 'Helm',      weight: 'Medium', mode: 'wvw' }],
  [83087, { slot: 'Shoulders', weight: 'Medium', mode: 'wvw' }],
  [82102, { slot: 'Coat',      weight: 'Medium', mode: 'wvw' }],
  [82552, { slot: 'Gloves',    weight: 'Medium', mode: 'wvw' }],
  [83862, { slot: 'Leggings',  weight: 'Medium', mode: 'wvw' }],
  [83699, { slot: 'Boots',     weight: 'Medium', mode: 'wvw' }],
  [84301, { slot: 'Helm',      weight: 'Heavy',  mode: 'wvw' }],
  [84181, { slot: 'Shoulders', weight: 'Heavy',  mode: 'wvw' }],
  [84481, { slot: 'Coat',      weight: 'Heavy',  mode: 'wvw' }],
  [82348, { slot: 'Gloves',    weight: 'Heavy',  mode: 'wvw' }],
  [83702, { slot: 'Leggings',  weight: 'Heavy',  mode: 'wvw' }],
  [83094, { slot: 'Boots',     weight: 'Heavy',  mode: 'wvw' }],
]);
