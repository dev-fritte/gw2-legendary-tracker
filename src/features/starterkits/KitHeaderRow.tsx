import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { WeaponCardInfo } from '@/hooks/useGen1WeaponCards.ts';
import type { WeaponType } from '@/types/gw2-api';
import { CHIP_STYLES, getChipVariant } from './starterKitStyles';

export interface KitHeaderRowProps {
  setNum: number;
  count: number;
  isOwned: boolean;
  isExpanded: boolean;
  kitChoices: (WeaponType | null)[];
  availableWeapons: WeaponType[];
  weaponCardMap: Map<WeaponType, WeaponCardInfo>;
  unlockedItemIds: Set<number>;
  partiallyCoveredWeaponTypes: Set<WeaponType>;
  coveredWeaponTypes: Set<WeaponType>;
  onToggle: () => void;
}

export function KitHeaderRow({
  setNum,
  count,
  isOwned,
  isExpanded,
  kitChoices,
  availableWeapons,
  weaponCardMap,
  unlockedItemIds,
  partiallyCoveredWeaponTypes,
  coveredWeaponTypes,
  onToggle,
}: KitHeaderRowProps) {
  const { t } = useTranslation();
  const openCount = kitChoices.filter((c) => c === null).length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 16px',
        cursor: 'pointer',
        background: isExpanded ? 'rgba(147,73,204,0.07)' : 'transparent',
        opacity: isOwned ? 1 : 0.4,
        transition: 'background 0.15s',
        userSelect: 'none',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isExpanded)
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(147,73,204,0.04)';
      }}
      onMouseLeave={(e) => {
        if (!isExpanded)
          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      <div style={{ width: 14, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {isExpanded ? (
          <ChevronDown style={{ width: 14, height: 14, color: '#9349CC' }} />
        ) : (
          <ChevronRight style={{ width: 14, height: 14, color: '#5a5468' }} />
        )}
      </div>

      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: isOwned ? '#9349CC' : '#3a3448',
          width: 16,
          flexShrink: 0,
          textAlign: 'right',
        }}
      >
        {count}
      </span>

      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: isOwned ? '#c8bee0' : '#6a6478',
          flexShrink: 0,
          minWidth: 160,
        }}
      >
        {t('starterKits.kitName', { num: setNum })}
      </span>

      {count > 1 && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#9349CC',
            background: 'rgba(147,73,204,0.15)',
            border: '1px solid rgba(147,73,204,0.3)',
            borderRadius: 10,
            padding: '1px 7px',
            flexShrink: 0,
          }}
        >
          ×{count}
        </span>
      )}

      {/* Summary chips */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flex: 1,
          flexWrap: 'wrap',
          minWidth: 0,
        }}
      >
        {isOwned ? (
          <>
            {kitChoices.map((choice, i) => {
              if (!choice) return null;
              const cardInfo = weaponCardMap.get(choice);
              const isItemOwned = cardInfo ? unlockedItemIds.has(cardInfo.id) : false;
              const isPartiallyCovered = partiallyCoveredWeaponTypes.has(choice);
              const isTypeCovered = coveredWeaponTypes.has(choice);
              const chipStyle = CHIP_STYLES[getChipVariant(isItemOwned, isPartiallyCovered, isTypeCovered)];
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    color: chipStyle.color,
                    background: chipStyle.background,
                    border: chipStyle.border,
                    borderRadius: 4,
                    padding: '1px 6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cardInfo && (
                    <img
                      src={cardInfo.icon}
                      alt=""
                      style={{ width: 14, height: 14, borderRadius: 2, objectFit: 'cover' }}
                    />
                  )}
                  {cardInfo ? cardInfo.name : t(`weapons.${choice}`)}
                </span>
              );
            })}
            {openCount > 0 && (
              <span style={{ fontSize: 11, color: '#4a4458', whiteSpace: 'nowrap' }}>
                {t('starterKits.openSlots', { count: openCount })}
              </span>
            )}
          </>
        ) : (
          availableWeapons.map((wt) => (
            <span
              key={wt}
              style={{
                fontSize: 11,
                color: '#9d93b0',
                background: 'rgba(147,73,204,0.12)',
                border: '1px solid rgba(147,73,204,0.28)',
                borderRadius: 4,
                padding: '1px 6px',
                whiteSpace: 'nowrap',
              }}
            >
              {t(`weapons.${wt}`)}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
