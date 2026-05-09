// GW2 API v2 TypeScript Interfaces

export interface GW2Account {
  id: string;
  name: string;
  age: number;
  world: number;
  guilds: string[];
  guild_leader?: string[];
  created: string;
  access: string[];
  commander: boolean;
  fractal_level?: number;
  daily_ap?: number;
  monthly_ap?: number;
  wvw_rank?: number;
}

export type WeaponSlot =
  | "WeaponA1"
  | "WeaponA2"
  | "WeaponB1"
  | "WeaponB2";

export type ArmorSlot =
  | "Helm"
  | "Shoulders"
  | "Coat"
  | "Gloves"
  | "Leggings"
  | "Boots"
  | "HelmAquatic"
  | "WeaponAquatic1"
  | "WeaponAquatic2";

export type TrinketSlot =
  | "Backpack"
  | "Accessory1"
  | "Accessory2"
  | "Amulet"
  | "Ring1"
  | "Ring2";

export type EquipmentSlot = WeaponSlot | ArmorSlot | TrinketSlot | "Sickle" | "Axe" | "Pick";

export type ItemRarity =
  | "Junk"
  | "Basic"
  | "Fine"
  | "Masterwork"
  | "Rare"
  | "Exotic"
  | "Ascended"
  | "Legendary";

export type WeaponType =
  | "Axe"
  | "Dagger"
  | "Mace"
  | "Pistol"
  | "Scepter"
  | "Sword"
  | "Focus"
  | "Shield"
  | "Torch"
  | "Warhorn"
  | "Greatsword"
  | "Hammer"
  | "LongBow"
  | "Rifle"
  | "ShortBow"
  | "Staff"
  | "Harpoon"
  | "Speargun"
  | "Trident";

export interface EquipmentItem {
  id: number;
  slot: EquipmentSlot;
  tabs?: number[];
  skin?: number;
  upgrades?: number[];
  infusions?: number[];
  binding?: "Character" | "Account";
  bound_to?: string;
  stats?: {
    id: number;
    attributes: Record<string, number>;
  };
  dyes?: (number | null)[];
}

export interface Character {
  name: string;
  race: string;
  gender: string;
  flags: string[];
  profession: string;
  level: number;
  guild?: string;
  age: number;
  created: string;
  deaths: number;
  equipment: EquipmentItem[];
  bags?: CharacterBag[];
}

export interface CharacterBag {
  id: number;
  size: number;
  inventory: (InventoryItem | null)[];
}

export interface InventoryItem {
  id: number;
  count: number;
  skin?: number;
  upgrades?: number[];
  infusions?: number[];
  binding?: "Character" | "Account";
  bound_to?: string;
}

export interface GW2Item {
  id: number;
  name: string;
  description?: string;
  type: string;
  level: number;
  rarity: ItemRarity;
  vendor_value: number;
  icon: string;
  flags: string[];
  game_types: string[];
  restrictions: string[];
  details?: ItemDetails;
}

export interface ItemDetails {
  type: string;
  damage_type?: string;
  min_power?: number;
  max_power?: number;
  defense?: number;
  infusion_slots?: InfusionSlot[];
  attribute_adjustment?: number;
  infix_upgrade?: InfixUpgrade;
  suffix_item_id?: number;
  secondary_suffix_item_id?: string;
}

export interface InfusionSlot {
  flags: string[];
  item_id?: number;
}

export interface InfixUpgrade {
  id?: number;
  attributes: Array<{
    attribute: string;
    modifier: number;
  }>;
  buff?: {
    skill_id: number;
    description: string;
  };
}

export interface GW2Profession {
  id: string;
  name: string;
  icon: string;
  icon_big: string;
}

export interface LegendaryArmoryItem {
  id: number;
  count: number;
}

export interface GW2Skin {
  id: number;
  name: string;
  type: string;
  flags: string[];
  restrictions: string[];
  icon: string;
  description?: string;
  details?: {
    type: string;
    damage_type?: string;
  };
}

// Derived types for internal use

export interface WeaponInfo {
  itemId: number;
  weaponType: WeaponType;
  name: string;
  icon: string;
  rarity: ItemRarity;
  slot: WeaponSlot;
}

export interface CharacterWeaponUsage {
  characterName: string;
  profession: string;
  level: number;
  weaponType: WeaponType;
  slot: WeaponSlot;
  isLegendary: boolean;
  itemId: number;
}

export interface LegendaryWeaponRecommendation {
  weaponType: WeaponType;
  /** Slots without a legendary equipped (the actual "need" count) */
  impact: number;
  /** All slots using this weapon type across selected characters */
  affectedCharacters: Array<{
    name: string;
    profession: string;
    slot: WeaponSlot;
    isLegendary: boolean;
  }>;
  /** Number of legendaries of this type in the armory */
  existingLegendaryCount: number;
  /** Whether any character has a legendary of this type equipped */
  hasEquippedLegendary: boolean;
  icon?: string;
  sampleItemId?: number;
}
