export type ArmorWeight = 'Heavy' | 'Medium' | 'Light';

export const PROFESSION_ARMOR_WEIGHT: Record<string, ArmorWeight> = {
  Guardian:    'Heavy',
  Warrior:     'Heavy',
  Revenant:    'Heavy',
  Engineer:    'Medium',
  Ranger:      'Medium',
  Thief:       'Medium',
  Elementalist:'Light',
  Mesmer:      'Light',
  Necromancer: 'Light',
};
