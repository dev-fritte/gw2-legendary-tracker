import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getGen1WeaponCardMap } from '@/utils/gen1WeaponCards';
import type { WeaponCardInfo } from '@/utils/gen1WeaponCards';
import type { WeaponType } from '@/types/gw2-api';

export type { WeaponCardInfo } from '@/utils/gen1WeaponCards';

export function useGen1WeaponCards(): { weaponCardMap: Map<WeaponType, WeaponCardInfo> } {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('de') ? 'de' : 'en';
  const weaponCardMap = useMemo(() => getGen1WeaponCardMap(lang), [lang]);
  return { weaponCardMap };
}
