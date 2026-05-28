import type { WeaponType } from '@/types/gw2-api';

/**
 * One-handed weapon types that can occupy BOTH a main-hand and an off-hand
 * slot simultaneously (by at least one profession in GW2).
 *
 * Owning only 1 legendary of these types covers one slot but leaves the other
 * non-legendary. A second copy is needed to have both slots fully covered in
 * the same equipment template.
 *
 * Examples: dual-axe Warrior, dual-dagger Thief, dual-pistol Thief/Engineer,
 * dual-sword Thief/Mesmer, dual-mace Guardian/Warrior.
 */
export const DUAL_WIELD_WEAPON_TYPES = new Set<WeaponType>([
  'Axe',
  'Dagger',
  'Mace',
  'Pistol',
  'Sword',
]);
