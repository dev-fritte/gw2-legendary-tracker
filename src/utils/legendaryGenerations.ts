export type LegendaryGeneration =
  | "gen1"
  | "gen2"
  | "gen3"
  | "standalone"
  | "armor_pve"
  | "armor_pvp"
  | "armor_wvw"
  | "trinket"
  | "back"
  | "upgrade"
  | "other";

const GEN1 = new Set<number>([
  30684, // Frostfang
  30685, // Kudzu
  30686, // The Dreamer
  30687, // Incinerator
  30688, // The Minstrel
  30689, // Eternity
  30690, // The Juggernaut
  30691, // Kamohoali'i Kotaki
  30692, // The Moot
  30693, // Quip
  30694, // The Predator
  30695, // Meteorlogicus
  30696, // The Flameseeker Prophecies
  30697, // Frenzy
  30698, // The Bifrost
  30699, // Bolt
  30700, // Rodgort
  30701, // Kraitkin
  30702, // Howler
  30703, // Sunrise
  30704, // Twilight
]);

const GEN2 = new Set<number>([
  71383, // Nevermore
  72713, // HOPE
  76158, // Astralaria
  78556, // Chuka and Champawat
  79562, // Eureka
  79802, // Shooshadoo
  80488, // The HMS Divinity
  81206, // Flames of War
  81839, // Sharur
  81957, // The Shining Blade
  86098, // The Binding of Ipos
  87109, // Claw of the Khan-Ur
  87687, // Verdarach
  88576, // Xiuquatl
  89854, // Pharus
  90551, // Exordium
]);

const STANDALONE = new Set<number>([
  103815, // Klobjarne Geirr
  105653, // Ancora Pax
  106273, // Ancora Bellum
]);

// PvP Legendary Armor
// Ardent Glorious (Light), Glorious Hero's (Medium + Heavy), Mistforged Glorious Hero's
const ARMOR_PVP = new Set<number>([
  83162, 84546, 83921, 82670, 83595, 84643, 83113, 83323,
  82465, 82214, 82245, 82512, 82519, 83127, 83348, 83929, 84633, 84655,
  84748, 82268, 82410, 83729, 82401, 84561, 83676, 82272, 84427,
  82334, 82423, 82698, 83240, 83957, 84341, 84461, 84723, 82098,
  89094, 89101, 89158, 89134, 89245, 89167, 89234, 89266,
  89093, 89117, 89126, 89152, 89174, 89183, 89209, 89235, 89252, 89260,
]);

// WvW Legendary Armor
// Triumphant Hero's, Mistforged Triumphant Hero's
const ARMOR_WVW = new Set<number>([
  83036, 82994, 83497, 82903, 82437, 83394, 84110, 84176,
  82456, 82093, 82173, 82196, 82801, 82902, 82963, 83289, 84578, 84629,
  82180, 83482, 83087, 83308, 84181, 82552, 83862, 83094, 83702,
  82102, 82109, 82348, 82502, 82925, 83699, 84301, 84481, 84508,
]);

export function getLegendaryGeneration(id: number, itemType: string): LegendaryGeneration {
  if (itemType === "Armor") {
    if (ARMOR_PVP.has(id)) return "armor_pvp";
    if (ARMOR_WVW.has(id)) return "armor_wvw";
    return "armor_pve";
  }
  if (itemType === "Trinket") return "trinket";
  if (itemType === "Back") return "back";
  if (itemType === "UpgradeComponent") return "upgrade";

  if (GEN1.has(id)) return "gen1";
  if (GEN2.has(id)) return "gen2";
  if (STANDALONE.has(id)) return "standalone";

  if (itemType === "Weapon") return "gen3";

  return "other";
}

export const GENERATION_ORDER: LegendaryGeneration[] = [
  "gen1",
  "gen2",
  "gen3",
  "standalone",
  "armor_pve",
  "armor_pvp",
  "armor_wvw",
  "trinket",
  "back",
  "upgrade",
  "other",
];
