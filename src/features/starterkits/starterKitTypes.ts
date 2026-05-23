import type { WeaponType } from '@/types/gw2-api';

export type KitChoices = Record<number, (WeaponType | null)[]>;
export type FilterMode = 'all' | 'owned';
