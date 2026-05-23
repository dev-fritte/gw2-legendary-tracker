import type { WeaponType } from '@/types/gw2-api';

export function normalizeChoices(
  stored: (WeaponType | null)[] | undefined,
  count: number,
): (WeaponType | null)[] {
  if (count === 0) return [];
  if (!stored || stored.length === 0) return Array(count).fill(null) as null[];
  if (stored.length === count) return stored;
  if (stored.length < count)
    return [...stored, ...(Array(count - stored.length).fill(null) as null[])];
  return stored.slice(0, count);
}

export function wikiUrl(name: string, lang: string): string {
  const host = lang.startsWith('de') ? 'wiki-de.guildwars2.com' : 'wiki.guildwars2.com';
  return `https://${host}/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`;
}
