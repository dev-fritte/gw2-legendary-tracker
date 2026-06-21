const API_KEY_STORAGE_KEY = 'gw2_legendary_tracker_api_key';
const ROADMAP_KEY = 'lmf.roadmap.v1';

export interface StoredStep {
  id: number;
  /** GW2 item ID — stored as an ID (not a localized name) so it survives language switches. */
  item: number | null;
  done: boolean;
  doneAt?: string;
}
const SELECTED_CHARS_KEY = 'gw2_legendary_tracker_selected_chars';
const KIT_CHOICES_KEY = 'gw2_legendary_tracker_kit_choices';
const MIN_PLAYTIME_KEY = 'gw2_legendary_tracker_min_playtime_hours';

export const storage = {
  getApiKey(): string | null {
    try {
      return localStorage.getItem(API_KEY_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  setApiKey(key: string): void {
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } catch {
      // localStorage unavailable (private mode, quota exceeded) — silently ignore
    }
  },

  clearApiKey(): void {
    try {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    } catch {
      // ignore
    }
  },

  getSelectedCharacters(): string[] {
    try {
      const raw = localStorage.getItem(SELECTED_CHARS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  },

  setSelectedCharacters(names: string[]): void {
    try {
      localStorage.setItem(SELECTED_CHARS_KEY, JSON.stringify(names));
    } catch {
      // ignore
    }
  },

  getKitChoices(): Record<string, (string | null)[]> {
    try {
      const raw = localStorage.getItem(KIT_CHOICES_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, (string | null)[]>;
    } catch {
      return {};
    }
  },

  setKitChoices(choices: Record<string, (string | null)[]>): void {
    try {
      localStorage.setItem(KIT_CHOICES_KEY, JSON.stringify(choices));
    } catch {
      // ignore
    }
  },

  getRoadmap(): StoredStep[] {
    try {
      const raw = localStorage.getItem(ROADMAP_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as StoredStep[];
      // Legacy entries stored the localized item name (string) instead of its ID —
      // those can't be resolved reliably anymore, so reset them to "unselected".
      return parsed.map((s) => (typeof s.item === 'string' ? { ...s, item: null } : s));
    } catch {
      return [];
    }
  },

  setRoadmap(steps: StoredStep[]): void {
    try {
      localStorage.setItem(ROADMAP_KEY, JSON.stringify(steps));
    } catch {
      // ignore
    }
  },

  getMinPlaytimeHours(): number {
    try {
      const raw = localStorage.getItem(MIN_PLAYTIME_KEY);
      if (!raw) return 0;
      const n = parseFloat(raw);
      return isNaN(n) ? 0 : n;
    } catch {
      return 0;
    }
  },

  setMinPlaytimeHours(hours: number): void {
    try {
      localStorage.setItem(MIN_PLAYTIME_KEY, String(hours));
    } catch {
      // ignore
    }
  },
};
