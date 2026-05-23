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
export type PickerTab = (typeof PICKER_TABS)[number] | 'Sonstige';

export const TAB_GENERATIONS: Record<string, LegendaryGeneration[]> = {
  Waffen: ['gen1', 'gen2', 'gen3', 'standalone'],
  Rüstung: ['armor_pve', 'armor_raids', 'armor_pvp', 'armor_wvw'],
  Schmuck: ['trinket'],
  Rückenteil: ['back'],
  'Runen & Sigille': ['upgrade'],
  Sonstige: ['other'],
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
  { id: 1, item: 'Bolt', done: true, doneAt: '14. März 2026' },
  { id: 2, item: 'Aurora', done: true, doneAt: '02. Mai 2026' },
  { id: 3, item: 'Frostfang', done: false },
  { id: 4, item: 'Ad Infinitum', done: false },
  { id: 5, item: 'Twilight', done: false },
  { id: 6, item: null, done: false },
];
