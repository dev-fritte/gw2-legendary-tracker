import { useTranslation } from 'react-i18next';
import type { WeaponCardInfo } from '@/hooks/useGen1WeaponCards.ts';
import type { WeaponType } from '@/types/gw2-api';
import { WeaponCard } from './WeaponCard';

export interface SlotRowProps {
  slotIndex: number;
  totalSlots: number;
  choice: WeaponType | null;
  availableWeapons: WeaponType[];
  weaponCardMap: Map<WeaponType, WeaponCardInfo>;
  unlockedItemIds: Set<number>;
  coveredWeaponTypes: Set<WeaponType>;
  onChange: (weapon: WeaponType | null) => void;
}

export function SlotRow({
  slotIndex,
  totalSlots,
  choice,
  availableWeapons,
  weaponCardMap,
  unlockedItemIds,
  coveredWeaponTypes,
  onChange,
}: SlotRowProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        background: 'rgba(20,16,28,0.6)',
        borderRadius: 8,
        border: '1px solid rgba(147,73,204,0.1)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4a4458',
        }}
      >
        {t('starterKits.slotLabel', { index: slotIndex, total: totalSlots })}
      </span>

      <div style={{ display: 'flex', gap: 8 }}>
        {availableWeapons.map((wt) => {
          const info = weaponCardMap.get(wt);
          return (
            <WeaponCard
              key={wt}
              weaponType={wt}
              cardInfo={info}
              isSelected={choice === wt}
              isItemOwned={info ? unlockedItemIds.has(info.id) : false}
              isTypeCovered={coveredWeaponTypes.has(wt)}
              onSelect={() => onChange(choice === wt ? null : wt)}
            />
          );
        })}
      </div>
    </div>
  );
}
