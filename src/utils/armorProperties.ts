import type { ArmorWeight } from './professionArmorWeight';

export type ArmorMode = 'pve' | 'raid' | 'pvp' | 'wvw';
export type ArmorSlotType = 'Helm' | 'Shoulders' | 'Coat' | 'Gloves' | 'Leggings' | 'Boots';

export const ALL_ARMOR_WEIGHTS: ArmorWeight[] = ['Heavy', 'Medium', 'Light'];
export const ALL_ARMOR_SLOTS: ArmorSlotType[] = ['Helm', 'Shoulders', 'Coat', 'Gloves', 'Leggings', 'Boots'];
export const ALL_ARMOR_MODES: ArmorMode[] = ['pve', 'raid', 'wvw', 'pvp'];

export const ARMOR_EQUIPMENT_SLOTS = new Set<string>(['Helm', 'Shoulders', 'Coat', 'Gloves', 'Leggings', 'Boots']);

// Showcase icons per weight × slot — Obsidian set (PvE, newest, consistent art)
export const ARMOR_SLOT_ICONS: Record<ArmorWeight, Record<ArmorSlotType, string>> = {
  Light: {
    Helm:      'https://render.guildwars2.com/file/1CC5E39F6362AD5B25081C090CBCB4F12512EB22/3256197.png',
    Shoulders: 'https://render.guildwars2.com/file/0CAFA9029802161CF256331DC94480C76F413B5A/3256199.png',
    Coat:      'https://render.guildwars2.com/file/46F1D0D780A0930E936B48B9B9BF720A7B239339/3256195.png',
    Gloves:    'https://render.guildwars2.com/file/C2EAC99A1F38707E4533C86F1AC45F6802D4F2AC/3256196.png',
    Leggings:  'https://render.guildwars2.com/file/CE032615F504521DC30C6F780C09FBF137A5FA7A/3256198.png',
    Boots:     'https://render.guildwars2.com/file/4D52B43E294580DD05592E1402F75D5F07CD7DE9/3256194.png',
  },
  Medium: {
    Helm:      'https://render.guildwars2.com/file/297112AF99D72E081010FE01DFD0EF4649192654/3256203.png',
    Shoulders: 'https://render.guildwars2.com/file/B2EE31E7095A7028CABB9462EA27433CDB340C48/3256205.png',
    Coat:      'https://render.guildwars2.com/file/A7DB4B5B5244D8B9D6CC6F5ED9303CE63BE06BF2/3256201.png',
    Gloves:    'https://render.guildwars2.com/file/743805FF0EE34E1DA26EE45E0B075A6A3D47723F/3256202.png',
    Leggings:  'https://render.guildwars2.com/file/A021E1194C612DC313D62F73EA5799ED021C3D4F/3256204.png',
    Boots:     'https://render.guildwars2.com/file/DBDB22ABE39D5BAA76C2F4FC9B294B7AF9FFF81B/3256200.png',
  },
  Heavy: {
    Helm:      'https://render.guildwars2.com/file/C905E4515CFB4AA52C7C57DF2F98D4DB0D04055D/3256184.png',
    Shoulders: 'https://render.guildwars2.com/file/BAC307B13FD2A4A803CA5CED056916D7B34DDFF8/3256186.png',
    Coat:      'https://render.guildwars2.com/file/0E039364A11D5B9A0F40ADB9D0A7FD6FEDB64DB0/3256182.png',
    Gloves:    'https://render.guildwars2.com/file/78A5446DC86D5FDE540B45102F973D94A2EDC3C0/3256183.png',
    Leggings:  'https://render.guildwars2.com/file/22BED3680AC1A1AB6B3ED4F8922891077DADF361/3256185.png',
    Boots:     'https://render.guildwars2.com/file/0EB6787B05B90E21D7982A3B2E75460166C6520D/3256181.png',
  },
};
