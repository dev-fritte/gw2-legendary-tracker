import type { TrinketSlotType } from '@/types/gw2-api';

export const DUAL_TRINKET_SLOT_TYPES = new Set<TrinketSlotType>(['Ring', 'Accessory']);

export const SLOT_TO_TRINKET_TYPE: Record<string, TrinketSlotType> = {
  Amulet:     'Amulet',
  Ring1:      'Ring',
  Ring2:      'Ring',
  Accessory1: 'Accessory',
  Accessory2: 'Accessory',
  Backpack:   'Back',
};

export const TRINKET_SLOTS = new Set(Object.keys(SLOT_TO_TRINKET_TYPE));

export const ALL_TRINKET_SLOT_TYPES: TrinketSlotType[] = ['Amulet', 'Ring', 'Accessory', 'Back'];

// Fallback showcase icons per slot type (shown when no equipped/armory item provides one)
// Amulet: Prismatic Champion's Regalia (95380), Ring: Coalescence (91234),
// Accessory: Vision (91048), Back: Ad Infinitum (74155)
export const TRINKET_SLOT_DEFAULT_ICONS: Record<TrinketSlotType, string> = {
  Amulet:    'https://render.guildwars2.com/file/046C2DACF8C064D23BD8374C7895DA2F13AD146F/2449345.png',
  Ring:      'https://render.guildwars2.com/file/962F99162FDE4AF471DF9E3BCA712CD6F5050B53/2149899.png',
  Accessory: 'https://render.guildwars2.com/file/A5587E6C220ECF0601523947DE33A0B34048800D/2149863.png',
  Back:      'https://render.guildwars2.com/file/562A009CE8D66B63B975251BC97041BFBE0E07E1/1202351.png',
};
