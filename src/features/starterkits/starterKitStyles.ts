import type { WeaponType } from '@/types/gw2-api';

// ─── Card styles ──────────────────────────────────────────────────────────────

export type CardVariant = 'selected' | 'owned' | 'covered' | 'default';

export interface CardStyles {
  borderColor: string;
  bgColor: string;
  boxShadow: string;
  imgFilter: string;
  nameColor: string;
  typeColor: string;
  hoverBorderColor: string;
}

export const CARD_STYLES: Record<CardVariant, CardStyles> = {
  selected: {
    borderColor: 'rgba(147,73,204,0.75)',
    bgColor: 'linear-gradient(145deg, rgba(147,73,204,0.14), rgba(122,58,170,0.08))',
    boxShadow: '0 0 12px rgba(147,73,204,0.2)',
    imgFilter: 'none',
    nameColor: '#d4c8e8',
    typeColor: '#9349CC',
    hoverBorderColor: 'rgba(147,73,204,0.75)',
  },
  owned: {
    borderColor: 'rgba(147,73,204,0.12)',
    bgColor: 'rgba(74,222,128,0.05)',
    boxShadow: 'none',
    imgFilter: 'none',
    nameColor: '#86efac',
    typeColor: 'rgba(74,222,128,0.6)',
    hoverBorderColor: 'rgba(147,73,204,0.3)',
  },
  covered: {
    borderColor: 'rgba(147,73,204,0.12)',
    bgColor: 'rgba(251,191,36,0.04)',
    boxShadow: 'none',
    imgFilter: 'brightness(0.8)',
    nameColor: '#fcd34d',
    typeColor: 'rgba(251,191,36,0.5)',
    hoverBorderColor: 'rgba(147,73,204,0.3)',
  },
  default: {
    borderColor: 'rgba(147,73,204,0.12)',
    bgColor: 'rgba(20,16,28,0.7)',
    boxShadow: 'none',
    imgFilter: 'brightness(0.65)',
    nameColor: '#5a5468',
    typeColor: '#3a3448',
    hoverBorderColor: 'rgba(147,73,204,0.3)',
  },
};

export function getCardVariant(
  isSelected: boolean,
  isItemOwned: boolean,
  isTypeCovered: boolean,
): CardVariant {
  if (isSelected) return 'selected';
  if (isItemOwned) return 'owned';
  if (isTypeCovered) return 'covered';
  return 'default';
}

// ─── Chip styles ──────────────────────────────────────────────────────────────

export type ChipVariant = 'owned' | 'covered' | 'default';

export const CHIP_STYLES: Record<
  ChipVariant,
  { color: string; background: string; border: string }
> = {
  owned: {
    color: '#86efac',
    background: 'rgba(74,222,128,0.08)',
    border: '1px solid rgba(74,222,128,0.25)',
  },
  covered: {
    color: '#fcd34d',
    background: 'rgba(251,191,36,0.08)',
    border: '1px solid rgba(251,191,36,0.25)',
  },
  default: {
    color: '#a78bca',
    background: 'rgba(147,73,204,0.1)',
    border: '1px solid rgba(147,73,204,0.22)',
  },
};

export function getChipVariant(isItemOwned: boolean, isTypeCovered: boolean): ChipVariant {
  if (isItemOwned) return 'owned';
  if (isTypeCovered) return 'covered';
  return 'default';
}

// Re-export WeaponType so consumers don't need a second import just for it
export type { WeaponType };
