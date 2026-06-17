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
