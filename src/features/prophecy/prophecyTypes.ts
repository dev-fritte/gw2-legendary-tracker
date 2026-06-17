import type { LegendaryGeneration } from '@/utils/legendaryGenerations';

// ─── Visual constants ─────────────────────────────────────────────────────────
export const PURPLE = '#9349CC';
export const PURPLE_DEEP = '#5a2a7e';
export const GOLD = '#e9c66b';
export const STEP_W = 240;
export const ROADMAP_KEY = 'lmf.roadmap.v1';

// ─── Picker tabs ──────────────────────────────────────────────────────────────
export const PICKER_TABS = [
  'Waffen',
  'Rüstung',
  'Schmuck',
  'Rückenteil',
  'Runen & Sigille',
] as const;

/** Internal key for the catch-all tab — translated via `picker.tabs.Other`. */
export const OTHER_TAB = 'Other' as const;

export type PickerTab = (typeof PICKER_TABS)[number] | typeof OTHER_TAB;

export const TAB_GENERATIONS: Record<string, LegendaryGeneration[]> = {
  Waffen: ['gen1', 'gen2', 'gen3', 'standalone'],
  Rüstung: ['armor_pve', 'armor_raids', 'armor_pvp', 'armor_wvw'],
  Schmuck: ['trinket'],
  Rückenteil: ['back'],
  'Runen & Sigille': ['upgrade'],
  [OTHER_TAB]: ['other'],
};

// ─── Step types ───────────────────────────────────────────────────────────────
export interface Step {
  id: number;
  item: string | null;
  done: boolean;
  doneAt?: string;
}

export type StepStatus = 'done' | 'active' | 'planned' | 'empty';

export const DEMO_ROADMAP: Step[] = [
  { id: 1, item: null, done: false },
  { id: 2, item: null, done: false },
  { id: 3, item: null, done: false },
  { id: 4, item: null, done: false },
];
