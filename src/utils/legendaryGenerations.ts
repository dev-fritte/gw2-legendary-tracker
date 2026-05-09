export type LegendaryGeneration =
  | "gen1"
  | "gen2"
  | "gen3"
  | "standalone"
  | "armor"
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

export function getLegendaryGeneration(id: number, itemType: string): LegendaryGeneration {
  if (itemType === "Armor") return "armor";
  if (itemType === "Trinket") return "trinket";
  if (itemType === "Back") return "back";
  if (itemType === "UpgradeComponent") return "upgrade";

  if (GEN1.has(id)) return "gen1";
  if (GEN2.has(id)) return "gen2";
  if (STANDALONE.has(id)) return "standalone";

  // All remaining weapons are Gen 3 (Aurene + dragon variants)
  if (itemType === "Weapon") return "gen3";

  return "other";
}

export const GENERATION_ORDER: LegendaryGeneration[] = [
  "gen1",
  "gen2",
  "gen3",
  "standalone",
  "armor",
  "trinket",
  "back",
  "upgrade",
  "other",
];
