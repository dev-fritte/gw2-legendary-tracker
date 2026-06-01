import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '@/services/apiClient';
import type { GW2Item } from '@/types/gw2-api';
import { getLegendaryGeneration, type LegendaryGeneration } from '@/utils/legendaryGenerations';
import { OTHER_TAB } from './prophecyTypes';

// ─────────────────────────────────────────────────────────────────────────────
// Picker item — enriched legendary item ready for the roadmap picker
// ─────────────────────────────────────────────────────────────────────────────
export interface LegendaryPickerItem {
  id: number;
  name: string;
  icon: string;
  description?: string;
  itemType: string; // 'Weapon' | 'Armor' | 'Trinket' | 'Back' | 'UpgradeComponent'
  generation: LegendaryGeneration;
  /** Weapon type, armor weight, trinket slot, etc. — from GW2 item details */
  detailType?: string;
}

/** Maps generation key to the picker top-level tab. */
export const GENERATION_TO_TAB: Record<LegendaryGeneration, string> = {
  gen1: 'Waffen',
  gen2: 'Waffen',
  gen3: 'Waffen',
  standalone: 'Waffen',
  armor_pve: 'Rüstung',
  armor_raids: 'Rüstung',
  armor_pvp: 'Rüstung',
  armor_wvw: 'Rüstung',
  trinket: 'Schmuck',
  back: 'Rückenteil',
  upgrade: 'Runen & Sigille',
  other: OTHER_TAB,
};

/** Per-generation accent tint for the ProphecyOrb glow when no icon is loaded. */
export const GENERATION_TINT: Record<LegendaryGeneration, string> = {
  gen1: '#e9c66b',
  gen2: '#9349CC',
  gen3: '#7ab8ff',
  standalone: '#86d970',
  armor_pve: '#ff8a4d',
  armor_raids: '#c8c8c8',
  armor_pvp: '#ff9ad4',
  armor_wvw: '#b8a8ff',
  trinket: '#9ad8ff',
  back: '#ffd866',
  upgrade: '#d97ed4',
  other: '#6a4d8a',
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/** Fetches all legendary armory items with full detail from the GW2 API.
 *  Reuses the same React-Query cache keys as useLegendaryOverview so the
 *  network request fires only once even when both hooks are mounted. */
export function useAllLegendaryItems(apiKey: string) {
  // Step 1 — all legendary armory entries (public endpoint, no user data)
  const allQuery = useQuery({
    queryKey: ['legendaryArmory', 'all'],
    queryFn: () => getApiClient(apiKey).getAllLegendaryArmory(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const allIds = (allQuery.data ?? []).map((e) => e.id);

  // Step 2 — full item data (same cache key as useLegendaryOverview → free)
  const itemsQuery = useQuery({
    queryKey: ['items', allIds],
    queryFn: () => getApiClient(apiKey).getItems(allIds),
    enabled: allQuery.isSuccess && allIds.length > 0,
    staleTime: 60 * 60 * 1000,
  });

  const items: LegendaryPickerItem[] = (itemsQuery.data ?? []).map((raw: GW2Item) => ({
    id: raw.id,
    name: raw.name,
    icon: raw.icon,
    description: raw.description,
    itemType: raw.type,
    generation: getLegendaryGeneration(raw.id, raw.type),
    detailType: raw.details?.type,
  }));

  // Stable lookup map — name → item (used to resolve step.item strings)
  const itemsByName = new Map<string, LegendaryPickerItem>(items.map((i) => [i.name, i]));

  return {
    items,
    itemsByName,
    isLoading: allQuery.isPending || itemsQuery.isPending,
  };
}
