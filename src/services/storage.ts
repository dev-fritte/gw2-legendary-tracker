const API_KEY_STORAGE_KEY = 'gw2_legendary_tracker_api_key';
const SELECTED_CHARS_KEY = 'gw2_legendary_tracker_selected_chars';
const KIT_CHOICES_KEY = 'gw2_legendary_tracker_kit_choices';

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
};
